// @ts-nocheck
import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { RootState } from "@/store";
import { fetchThreadMessages, setChatInputMessage } from "@/store/messageSlice";
import { navigate } from "expo-router/build/global-state/routing";
import React, { useEffect, useRef, useState } from "react";
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
    (dispatch as any)(fetchThreadMessages({ threadId }));
  }, []);

  const messages = threadData?.messages ?? [];

  const handleInputChange = (text: string) => {
    setInputMessage(text);
    dispatch(setChatInputMessage(text));
  };

  useEffect(() => {
    if (!threadData?.id) {
      navigate("/home/Home");
    }
  }, [threadData?.id]);

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

    if (awaitingResponse) {
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
                awaitingResponse ? (
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
                  awaitingResponse
                    ? "Waiting for AI response..."
                    : messagingDisabled
                    ? "Messaging disabled"
                    : "Type your message..."
                }
                disabled={awaitingResponse || messagingDisabled}
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
