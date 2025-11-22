import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import AttachmentsCard from "./components/AttachmentsCard";
import DeprecatedThreadBanner from "./components/DeprecatedThread";
import LockedDocument from "./components/LockedDocument";
import QuickActions from "./components/QuickActions";
import UnlockedDocument from "./components/UnlockedDocument";

export default function RenderMessages({ message, threadId }: any) {
  const [expanded, setExpanded] = useState(false);

  const messageText =
    message?.payload?.text || message?.payload?.message_text || "";
  const messageType = message?.message_type;
  const isUser = message?.is_user_message;

  const shouldTruncate = messageType === "chat" && messageText.length > 700;
  const displayedText =
    shouldTruncate && !expanded
      ? messageText.slice(0, 700) + "..."
      : messageText;

  // ----- CHAT MESSAGES -----
  if (messageType === "chat") {
    return (
      <View
        style={[
          styles.chatRow,
          isUser ? styles.userContainer : styles.aiContainer,
        ]}
      >
        <View
          style={[
            styles.chatBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Markdown style={markdownStyles}>{displayedText}</Markdown>

          {shouldTruncate && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={styles.seeMoreText}>
                {expanded ? "See less" : "See more"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ----- INFORMATION MESSAGE -----
  if (messageType === "information_message") {
    return (
      <View style={styles.wrapper}>
        <View style={styles.infoBox}>
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
          <Text style={styles.legalText}>
            Request has been sent for a lawyer. Please check your email.
          </Text>
        </View>
      </View>
    );
  }

  // ----- DOCUMENT GENERATED → use UnlockedDocument -----
  if (messageType === "locked_document_generated") {
    return <LockedDocument message={message} />;
  }

  // ----- DOCUMENT GENERATED → use UnlockedDocument -----
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
  // -----  OTHER -----
  return (
    <View style={styles.wrapper}>
      <Text style={styles.jsonDump}>{JSON.stringify(message, null, 2)}</Text>
    </View>
  );
}

//
// STYLES
//
const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    alignItems: "flex-start",
  },

  chatRow: { flexDirection: "row", marginVertical: 4 },
  userContainer: { justifyContent: "flex-end" },
  aiContainer: { justifyContent: "flex-start" },

  chatBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "90%",
    minWidth: "60%",
  },
  userBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },

  aiBubble: {
    backgroundColor: "#f8f9fbff",
    alignSelf: "flex-start",
  },

  infoBox: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#3F65A90F",
    borderRadius: 12,
    alignItems: "center",
  },
  infoText: { fontSize: 16, color: "#353535" },

  legalBox: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#3F65A90F",
    borderRadius: 12,
    alignItems: "center",
  },
  legalText: { fontSize: 14, color: "#000" },

  jsonDump: { fontSize: 10, color: "#444" },

  seeMoreText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
    color: "#3F65A9",
  },
});

const markdownStyles = {
  body: {
    color: "#000",
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
    color: "#000",
  },
  heading2: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
    color: "#000",
  },
  heading3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 4,
    color: "#000",
  },
  heading4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 4,
    color: "#000",
  },
  heading5: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 4,
    color: "#000",
  },
  heading6: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 4,
    color: "#000",
  },
  code_inline: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 14,
  },
  code_block: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
  fence: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
};
