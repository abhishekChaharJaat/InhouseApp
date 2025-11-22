// @ts-nocheck
import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { token } from "@/app/data";
import { RootState } from "@/store";
import {
  fetchThreadMessages,
  setAwaitingResponse,
  setChatInputMessage,
} from "@/store/messageSlice";
import { navigate } from "expo-router/build/global-state/routing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { useWebSocket } from "../providers/WebSocketProvider";
import ChatBox from "./chatpage-components/ChatBox";
import RenderMessages from "./RenderMessages";

function ChatPage({ threadId }: any) {
  const threadData = useSelector(
    (state: RootState) => state.message.threadData
  );
  const loadingMessages = useSelector(
    (state: RootState) => state.message.loadingMessages
  );
  const awaitingResponse = useSelector(
    (state: RootState) => state.message.awaitingResponse
  );
  const chatInputMessage = useSelector(
    (state: RootState) => state.message.chatInputMessage
  );
  const messagingDisabled = useSelector(
    (state: RootState) => state.message.threadData.messaging_disabled
  );

  const dispatch = useDispatch();
  const { sendMessage, createMessage, isConnected } = useWebSocket();

  const [inputMessage, setInputMessage] = useState("");

  const flatListRef = useRef<FlatList<any>>(null);
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    (dispatch as any)(fetchThreadMessages({ threadId, token }));
  }, []);

  useEffect(() => {
    if (!threadData?.id) {
      navigate("/home/Home");
    }
  }, [threadData?.id]);

  // Animate typing indicator dots
  useEffect(() => {
    if (awaitingResponse) {
      const animateDot = (opacity: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animations = [
        animateDot(dot1Opacity, 0),
        animateDot(dot2Opacity, 200),
        animateDot(dot3Opacity, 400),
      ];

      animations.forEach((anim) => anim.start());

      return () => {
        animations.forEach((anim) => anim.stop());
      };
    } else {
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
    }
  }, [awaitingResponse]);

  const messages = threadData?.messages ?? [];

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

    if (messagingDisabled) {
      Alert.alert(
        "Messaging Disabled",
        "Messaging is currently disabled for this thread"
      );
      return;
    }

    // Send message to existing thread
    const message = createMessage("ask", "add-message", {
      thread_id: threadId,
      message: trimmedMessage,
    });

    const success = sendMessage(message, true);

    if (success) {
      setInputMessage("");
      dispatch(setChatInputMessage(""));
      dispatch(setAwaitingResponse(true));
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleAttach = () => {
    Alert.alert(
      "Coming Soon",
      "File attachment feature will be available soon"
    );
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
                  ? "Initiate your chat"
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
                  <View style={styles.typingIndicatorContainer}>
                    <View style={styles.typingBubble}>
                      <View style={styles.dotsContainer}>
                        <Animated.View
                          style={[styles.dot, { opacity: dot1Opacity }]}
                        />
                        <Animated.View
                          style={[styles.dot, { opacity: dot2Opacity }]}
                        />
                        <Animated.View
                          style={[styles.dot, { opacity: dot3Opacity }]}
                        />
                      </View>
                    </View>
                  </View>
                ) : null
              }
              extraData={messages.length + (awaitingResponse ? 1 : 0)}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 10 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              // Auto-scroll to bottom when content changes
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
            />
          )}

          {/* Input at bottom - tap here to dismiss keyboard */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <ChatBox
                value={inputMessage}
                onChangeText={handleInputChange}
                onSend={handleSend}
                onAttach={handleAttach}
                placeholder={
                  messagingDisabled
                    ? "Messaging is disabled"
                    : awaitingResponse
                    ? "Waiting for response..."
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
  typingIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 8,
    marginLeft: 4,
  },
  typingBubble: {
    backgroundColor: "#f8f9fbff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "90%",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
  },
});
