import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { useRouter } from "expo-router";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ChatBox from "../chat/ChatBox";
import Topnav from "../navs/Topnav";

function ChatPage() {
  const router = useRouter();

  return (
    <CustomSafeAreaView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          <Topnav page="chat" />

          <View style={styles.container}>
            <Text style={styles.title}>ChatPage</Text>

            {/* Messages area */}
            <View style={styles.messagesContainer}>
              {/* FlatList / ScrollView of messages here */}
            </View>

            {/* Input at bottom */}
            <ChatBox />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </CustomSafeAreaView>
  );
}

export default ChatPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  messagesContainer: {
    flex: 1,
  },
});
