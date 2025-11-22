import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { token } from "@/app/data";
import { fetchThreadMessages } from "@/store/messageSlice";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
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
import Topnav from "../components/navs/Topnav";
import ChatBox from "./components/ChatBox";
import RenderMessages from "./RenderMessages";
function ChatPage({ threadId }: any) {
  const threadData = useSelector((state: any) => state.message.threadData);
  const loadingMessages = useSelector(
    (state: any) => state.message.loadingMessages
  );
  const dispatch = useDispatch();

  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    (dispatch as any)(fetchThreadMessages({ threadId, token }));
  }, []);

  const messages = threadData?.messages ?? [];

  return (
    <CustomSafeAreaView>
      <Topnav page="chat" title={threadData?.title} />

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
              <Text style={styles.loadingText}>Loading Messages...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RenderMessages message={item} threadId={threadId} />
              )}
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
              <ChatBox />
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
});
