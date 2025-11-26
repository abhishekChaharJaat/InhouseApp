// Shimmer.tsx - Enhanced loading component with different message types and progress
import { LOADING_MESSAGE_TYPES, LOADING_MESSAGES } from "@/app/utils/constants";
import { RootState } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

const Shimmer = () => {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const [elapsedMinute, setElapsedMinute] = useState(0);
  const [currentLoadingType, setCurrentLoadingType] = useState("DEFAULT");
  const [currentPayload, setCurrentPayload] = useState<any>(null);

  const progressIndexRef = useRef(0);
  const messageIndexRef = useRef(0);
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const dotsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadingMessageType = useSelector(
    (state: RootState) => state.message.loadingMessageType
  );
  const loadingMessagePayload = useSelector(
    (state: RootState) => state.message.loadingMessagePayload
  );
  const threadData = useSelector(
    (state: RootState) => state.message.threadData
  );

  // Get chatInfo from last update_loading_message in thread (like web app)
  useEffect(() => {
    const messages = threadData?.messages || [];
    const lastLoadingMessage = [...messages]
      .reverse()
      .find((msg: any) => msg.message_type === "update_loading_message");

    if (lastLoadingMessage?.payload) {
      const payload = lastLoadingMessage.payload;

      // Determine loading type from payload
      if (payload.doc_generation_payload) {
        setCurrentLoadingType(LOADING_MESSAGE_TYPES.DOC_GENERATION);
        setCurrentPayload(payload.doc_generation_payload);
      } else if (payload.web_search_payload) {
        setCurrentLoadingType(LOADING_MESSAGE_TYPES.WEB_SEARCH);
        setCurrentPayload(payload.web_search_payload);
      } else if (payload.issue_spotting_payload) {
        setCurrentLoadingType(LOADING_MESSAGE_TYPES.ISSUE_SPOTTING);
        setCurrentPayload(payload.issue_spotting_payload);
      } else if (payload.loading_message_type) {
        setCurrentLoadingType(payload.loading_message_type);
        setCurrentPayload(null);
      } else {
        setCurrentLoadingType("DEFAULT");
        setCurrentPayload(null);
      }
    } else if (loadingMessageType) {
      // Fallback to redux state
      setCurrentLoadingType(loadingMessageType);
      setCurrentPayload(loadingMessagePayload);
    } else {
      setCurrentLoadingType("DEFAULT");
      setCurrentPayload(null);
    }
  }, [threadData?.messages, loadingMessageType, loadingMessagePayload]);

  // Animate dots: "", ".", "..", "..."
  useEffect(() => {
    dotsIntervalRef.current = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 250);

    return () => {
      if (dotsIntervalRef.current) {
        clearInterval(dotsIntervalRef.current);
      }
    };
  }, []);

  // Handle message and progress updates based on loading type
  useEffect(() => {
    // Clear existing intervals
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Get the loading messages config for this type
    const config =
      (LOADING_MESSAGES as any)[currentLoadingType] || LOADING_MESSAGES.DEFAULT;
    const messages = config.messages || [];
    const timeRange = config.time_range || 20; // in seconds

    if (messages.length === 0) return;

    // Calculate timing
    const timePerMessage = timeRange / messages.length;
    const progressUpdateInterval = timeRange < 60 ? 2000 : 5000; // 2s or 5s
    const progressIncrement =
      100 / ((timeRange * 1000) / progressUpdateInterval);

    // Initialize
    setText(messages[0]?.text || "");
    setProgress(0);
    messageIndexRef.current = 0;
    progressIndexRef.current = 0;

    // For DOC_GENERATION, check elapsed time from payload
    if (
      currentLoadingType === LOADING_MESSAGE_TYPES.DOC_GENERATION &&
      currentPayload?.created_at
    ) {
      const startTime = new Date(currentPayload.created_at + "Z").getTime();
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - startTime;
      const elapsedSeconds = Math.floor(elapsedTime / 1000);
      setElapsedMinute(elapsedSeconds / 60);

      // Adjust message index based on elapsed time
      const adjustedMessageIndex = Math.floor(elapsedSeconds / timePerMessage);
      messageIndexRef.current = Math.min(
        adjustedMessageIndex,
        messages.length - 1
      );
      setText(messages[messageIndexRef.current]?.text || "");

      // Adjust progress based on elapsed time
      const elapsedProgress = (elapsedSeconds / timeRange) * 100;
      setProgress(Math.min(elapsedProgress, 95));
    }

    // Progress interval
    progressIntervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + progressIncrement;

        // Update elapsed time for DOC_GENERATION
        if (
          currentLoadingType === LOADING_MESSAGE_TYPES.DOC_GENERATION &&
          currentPayload?.created_at
        ) {
          const startTime = new Date(currentPayload.created_at + "Z").getTime();
          const currentTime = new Date().getTime();
          const elapsedTime = currentTime - startTime;
          const elapsedSeconds = Math.floor(elapsedTime / 1000);
          setElapsedMinute(elapsedSeconds / 60);
        }

        if (nextProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 100;
        }
        return Math.min(95, nextProgress);
      });
    }, progressUpdateInterval);

    // Message interval
    messageIntervalRef.current = setInterval(() => {
      messageIndexRef.current++;
      const nextIndex = Math.min(messageIndexRef.current, messages.length - 1);
      setText(messages[nextIndex]?.text || "");

      if (messageIndexRef.current >= messages.length - 1) {
        if (messageIntervalRef.current) {
          clearInterval(messageIntervalRef.current);
          messageIntervalRef.current = null;
        }
      }
    }, timePerMessage * 1000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    };
  }, [currentLoadingType, currentPayload]);

  // Render DOC_GENERATION with progress bar
  if (currentLoadingType === LOADING_MESSAGE_TYPES.DOC_GENERATION) {
    return (
      <View style={styles.docGenerationContainer}>
        <View style={styles.docCard}>
          {/* Title */}
          <Text style={styles.docTitle} numberOfLines={1}>
            {threadData?.title || "Document"}
          </Text>

          {/* Status text with dots */}
          <Text style={styles.docStatusText}>
            {text}
            {dots}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.ceil(progress)}%</Text>
          </View>
        </View>

        {/* Info alerts based on elapsed time */}
        {elapsedMinute >= 0 && elapsedMinute < 10 && (
          <View style={styles.infoAlert}>
            <Text style={styles.infoAlertText}>
              It may take 10 minutes to complete, so feel free to leave this
              screen. We will send an email when your document is completed.
            </Text>
          </View>
        )}
        {elapsedMinute >= 10 && elapsedMinute < 15 && (
          <View style={styles.warningAlert}>
            <Text style={styles.warningAlertText}>
              Your document is taking longer than expected to generate. We
              appreciate your patience and are working hard to complete it as
              soon as possible.
            </Text>
          </View>
        )}
        {elapsedMinute >= 15 && (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>
              Your document is delayed. Please contact support@inhouse.ai for
              assistance.
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Default shimmer with just text
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {text}
        {dots}
      </Text>
    </View>
  );
};

export default Shimmer;

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2933",
  },
  // DOC_GENERATION styles
  docGenerationContainer: {
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 12,
  },
  docCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  docStatusText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#353535",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0A0A",
    minWidth: 40,
    textAlign: "right",
  },
  // Alert styles
  infoAlert: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoAlertText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  warningAlert: {
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  warningAlertText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  errorAlert: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  errorAlertText: {
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
  },
});
