// RenderMessages.js
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import UnlockedDocument from "./UnlockedDocument";

export default function RenderMessages({ message, threadId }: any) {
  const messageText =
    message?.payload?.text || message?.payload?.message_text || "";
  const messageType = message?.message_type;
  const isUser = message?.is_user_message;

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
          <Markdown style={markdownStyles}>{messageText}</Markdown>
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
  if (
    messageType === "locked_document_generated" ||
    messageType === "document_generated"
  ) {
    return <UnlockedDocument message={message} />;
  }

  // ----- ATTACHMENTS -----
  if (messageType === "attachment") {
    return <Text>Attachments</Text>;
  }

  // ----- QUICK ACTION BUTTONS (PILL SHAPE LIKE SCREENSHOT) -----
  if (
    messageType === "quick_actions" ||
    messageType === "quick_action_button_messages"
  ) {
    const buttons = message?.payload?.buttons || [];

    if (buttons.length > 0) {
      return (
        <View style={styles.wrapper}>
          <View style={styles.quickActionsContainer}>
            {buttons.map((button: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionPill}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionText}>{button?.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
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
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },

  chatRow: { flexDirection: "row", marginVertical: 4 },
  userContainer: { justifyContent: "flex-end" },
  aiContainer: { justifyContent: "flex-start" },

  chatBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "90%",
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
  infoText: { fontSize: 12, color: "#353535" },

  legalBox: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#3F65A90F",
    borderRadius: 12,
    alignItems: "center",
  },
  legalText: { fontSize: 13, color: "#000" },

  // QUICK ACTION BUTTONS
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  quickActionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
    marginRight: 10,
    marginBottom: 10,
  },

  quickActionText: {
    fontSize: 15,
    color: "#1F2933",
    fontWeight: "500",
  },

  jsonDump: { fontSize: 10, color: "#444" },
});

const markdownStyles = {
  body: { color: "#000", fontSize: 16, lineHeight: 20 },
};
