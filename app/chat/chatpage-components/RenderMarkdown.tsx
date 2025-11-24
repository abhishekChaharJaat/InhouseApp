import React, { memo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";

function ChatMessage({ message }: any) {
  const [expanded, setExpanded] = useState(false);

  const messageText =
    (message &&
      message.payload &&
      (message.payload.text || message.payload.message_text)) ||
    "";

  const isUser = message && message.is_user_message;
  const messageType = message && message.message_type;

  const shouldTruncate = messageType === "chat" && messageText.length > 700;
  const displayedText =
    shouldTruncate && !expanded
      ? messageText.slice(0, 700) + "..."
      : messageText;

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

export default memo(ChatMessage, (prevProps, nextProps) => {
  return prevProps.message && nextProps.message
    ? prevProps.message.id === nextProps.message.id
    : prevProps.message === nextProps.message;
});

const styles = StyleSheet.create({
  chatRow: { flexDirection: "row", marginVertical: 4 },
  userContainer: { justifyContent: "flex-end" },
  aiContainer: { justifyContent: "flex-start" },

  chatBubble: {
    padding: 14,
    paddingBottom: 8,
    borderRadius: 12,
    maxWidth: "90%",
    minWidth: "10%",
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
    elevation: 0.5,
  },

  aiBubble: {
    // backgroundColor: "#f8f9fbff",
    alignSelf: "flex-start",
    width: "90%",
  },

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
