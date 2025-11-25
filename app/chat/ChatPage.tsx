// @ts-nocheck
import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { RootState } from "@/store";
import {
  fetchThreadMessages,
  setAwaitingResponse,
  setChatInputMessage,
  setLoadingMessagePayload,
  setMessagingDisabled,
  updateLoadingMessageType,
} from "@/store/messageSlice";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Topnav from "../navs/Topnav";
import {
  addMessageToThread,
  sendWebSocketMessage,
} from "../providers/wsClient";
import ChatBox from "./chatpage-components/ChatBox";
import Shimmer from "./chatpage-components/Shimmer";
import RenderMessages from "./RenderMessages";

function ChatPage({ threadId }: any) {
  const threadData = useSelector(
    (state: RootState) => state.message.threadData
  );
  const loadingMessages = useSelector(
    (state: RootState) => state.message.loadingMessages
  );
  const chatInputMessage = useSelector(
    (state: RootState) => state.message.chatInputMessage
  );
  const messagingDisabled = useSelector(
    (state: RootState) => state.message.threadData.messaging_disabled
  );
  const awaitingResponse = useSelector(
    (state: RootState) => state.message.awaitingResponse
  );

  const dispatch = useDispatch();
  const [inputMessage, setInputMessage] = useState("");
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    (dispatch as any)(fetchThreadMessages(threadId));
  }, [threadId, dispatch]);

  const messages = threadData?.messages ?? [];

  // Check if last message is update_loading_message with doc_generation_payload
  const isDocGenerating = useMemo(() => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage?.message_type === "update_loading_message" &&
      lastMessage?.payload?.doc_generation_payload != null
    );
  }, [messages]);

  // When thread loads with doc_generation in progress, set up the loading state
  useEffect(() => {
    if (isDocGenerating && !loadingMessages) {
      const lastMessage = messages[messages.length - 1];
      const payload = lastMessage?.payload;

      // Set loading state
      dispatch(setAwaitingResponse(true));
      dispatch(setMessagingDisabled(true));

      // Set the loading message type and payload
      if (payload?.doc_generation_payload) {
        dispatch(updateLoadingMessageType("DOC_GENERATION"));
        dispatch(setLoadingMessagePayload(payload.doc_generation_payload));
      }
    }
  }, [isDocGenerating, loadingMessages, messages, dispatch]);

  // Determine if shimmer should show (either awaitingResponse OR doc is generating)
  const shouldShowShimmer = awaitingResponse || isDocGenerating;

  const handleInputChange = (text: string) => {
    setInputMessage(text);
    dispatch(setChatInputMessage(text));
  };

  const handleSend = () => {
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    if (!threadData?.id) {
      Alert.alert("Error", "No active thread");
      return;
    }

    if (shouldShowShimmer) {
      Alert.alert("Please wait", "Waiting for AI response...");
      return;
    }

    // Send message via WebSocket
    const message = addMessageToThread(threadData.id, trimmedMessage);
    const success = sendWebSocketMessage(null, message);

    if (success) {
      console.log("Message sent to thread:", threadData.id);
      setInputMessage("");
    }
  };

  const handleAttach = () => {
    Alert.alert("Feature Unavailable", "File attachment coming soon.");
  };

  return (
    <CustomSafeAreaView>
      <Topnav page="chat" title={threadData?.title} threadId={threadId} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <View style={styles.container}>
          {/* Messages list - scrollable */}
          {loadingMessages ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#3F65A9" />
              <Text style={styles.loadingText}>
                {messages.length === 0
                  ? "Loading chat history"
                  : "Loading Messages..."}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RenderMessages message={item} threadId={threadId} />
              )}
              ListFooterComponent={
                shouldShowShimmer ? (
                  <View style={styles.shimmerBox}>
                    <Shimmer />
                  </View>
                ) : null
              }
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 10 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
            />
          )}

          {/* Input at bottom */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <ChatBox
                value={inputMessage}
                onChangeText={handleInputChange}
                onSend={handleSend}
                onAttach={handleAttach}
                placeholder={
                  shouldShowShimmer
                    ? "Waiting for AI response..."
                    : messagingDisabled
                    ? "Messaging disabled"
                    : "Type your message..."
                }
                disabled={
                  shouldShowShimmer ||
                  messagingDisabled ||
                  threadData?.messaging_disabled
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
}

export default ChatPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#3F65A9",
    fontWeight: "500",
    marginTop: 12,
  },
  shimmerBox: {
    alignItems: "flex-start",
  },
});
