// LockedDocument.tsx
import { handleLegalReviewButtonClicked } from "@/app/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
export default function LockedDocument({ message }: any) {
  const [showLockedDoc, setShowLockedDoc] = useState(false);
  const googleDocId = message?.payload?.google_doc_id;
  const threadData = useSelector((state: any) => state.message.threadData);
  const userMetadata = useSelector(
    (state: any) => state.onboarding.userMetadata
  );
  if (!googleDocId) return null;
  // const previewUrl = `https://docs.google.com/document/d/${googleDocId}/export?format=pdf`;
  const previewUrl = `https://docs.google.com/document/d/${googleDocId}/preview?rm=minimal`;
  const dispatch = useDispatch();
  useEffect(() => {
    const unlockDoc = threadData?.messages.find(
      (msg: any) => msg.message_type === "document_generated"
    );

    if (!unlockDoc) {
      setShowLockedDoc(true);
    }
  }, []);

  const handleAccessDoc = async () => {
    const msg = threadData.messages
      .slice()
      .reverse()
      .find((m: any) => m.message_type === "quick_actions");

    const btn = msg.payload.buttons[0];
    handleLegalReviewButtonClicked(
      btn,
      dispatch,
      userMetadata,
      threadData?.id,
      true
    );
  };

  if (!showLockedDoc) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.docContainer}>
        {/* Preview Only (cropped, no top 30px of doc page) */}
        <View style={styles.previewContainer}>
          <WebView
            source={{ uri: previewUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scrollEnabled={false}
            nestedScrollEnabled={false}
          />

          <TouchableOpacity
            style={styles.accessButton}
            activeOpacity={0.85}
            onPress={handleAccessDoc}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={18}
              color="white"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.accessButtonText}>Access document</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },

  docContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfc0c0ff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },

  previewContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "white",
    position: "relative",
    overflow: "hidden",
    padding: 8, // 👈 important: clip webview content
  },

  webview: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: -100,
    marginHorizontal: -8, // 👈 hide top 30px of doc page
  },

  accessButton: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#1b2b48",
    borderWidth: 1,
    borderColor: "#1b2b48",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  accessButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
