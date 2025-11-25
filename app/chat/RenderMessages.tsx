import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import AttachmentsCard from "./chatpage-components/AttachmentsCard";
import DeprecatedThreadBanner from "./chatpage-components/DeprecatedThread";
import LockedDocument from "./chatpage-components/LockedDocument";
import QuickActions from "./chatpage-components/QuickActions";
import RegenerateAiResponse from "./chatpage-components/RegenerateAiResponse";
import RenderMarkdown from "./chatpage-components/RenderMarkdown";
import UnlockedDocument from "./chatpage-components/UnlockedDocument";
function RenderMessages({ message, threadId }: any) {
  const messageText =
    message?.payload?.text || message?.payload?.message_text || "";
  const messageType = message?.message_type;

  // ----- CHAT MESSAGES -----
  if (messageType === "chat") {
    return <RenderMarkdown message={message} />;
  }

  // ----- INFORMATION MESSAGE -----
  if (messageType === "information_message") {
    return (
      <View style={styles.wrapper}>
        <View style={styles.infoBox}>
          <Ionicons
            name="flash-outline"
            size={22}
            color="#B45F04"
            style={styles.lightning}
          />
          <Text style={styles.infoText}>{messageText}</Text>
        </View>
      </View>
    );
  }

  // ----- LEGAL REVIEW MESSAGE -----
  if (messageType === "legal_review_message") {
    return (
      <View style={styles.wrapper}>
        <View style={styles.legalBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#0f7ccfff"
            style={styles.lightning}
          />
          <Text style={styles.legalText}>
            Request has been sent for a lawyer. Please check your email.
          </Text>
        </View>
      </View>
    );
  }

  // ----- DOCUMENT GENERATED → LockedDocument -----
  if (messageType === "locked_document_generated") {
    return <LockedDocument message={message} />;
  }

  // ----- DOCUMENT GENERATED → UnlockedDocument -----
  if (messageType === "document_generated") {
    return <UnlockedDocument message={message} />;
  }

  // ----- ATTACHMENTS -----
  if (messageType === "attachment") {
    const payload = message?.payload || {};
    return <AttachmentsCard payload={payload} />;
  }

  // ----- QUICK ACTION BUTTONS -----
  if (
    messageType === "quick_actions" ||
    messageType === "quick_action_button_messages"
  ) {
    return <QuickActions message={message} />;
  }

  if (messageType === "update_loading_message") {
    return <></>;
  }

  if (messageType === "deprecated_thread_message") {
    return (
      <>
        <DeprecatedThreadBanner />
      </>
    );
  }

  if (messageType === "regenerate_ai_response") {
    return (
      <>
        <RegenerateAiResponse />
      </>
    );
  }

  // ----- OTHER -----
  return (
    <View style={styles.wrapper}>
      <Text style={styles.jsonDump}>{JSON.stringify(message, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    paddingHorizontal: 4,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#FDEBD0"
    backgroundColor: "#fef0daff", // light warm background (optional)
    padding: 10,
    borderRadius: 8,
    flexShrink: 1,
  },

  lightning: {
    marginRight: 6,
  },

  infoText: {
    fontSize: 14,
    color: "#6E2C00",
    flexShrink: 1,
  },

  legalBox: {
    padding: 10,
    backgroundColor: "#3F65A90F",
    borderRadius: 12,
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
  },
  legalText: { fontSize: 14, color: "#000" },
  jsonDump: { fontSize: 10, color: "#444" },
});

// Export memoized version for performance
export default memo(RenderMessages, (prevProps, nextProps) => {
  return (
    prevProps.message?.id === nextProps.message?.id &&
    prevProps.threadId === nextProps.threadId
  );
});
