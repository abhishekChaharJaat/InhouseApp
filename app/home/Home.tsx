import ChatBox from "@/app/chat/components/ChatBox";
import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import {
  clearRedirectFlag,
  setAwaitingResponse,
  setChatInputMessage,
} from "@/store/messageSlice";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Topnav from "../components/navs/Topnav";
import { useWebSocket } from "../providers/WebSocketProvider";

function Home() {
  const router = useRouter();
  const { user } = useUser();
  const dispatch = useDispatch();
  const { sendMessage, createMessage, isConnected, setPendingInitialMessage } =
    useWebSocket();

  const [inputMessage, setInputMessage] = useState("");

  // Get state from Redux
  const threadData = useSelector((state: any) => state.message.threadData);
  const awaitingResponse = useSelector(
    (state: any) => state.message.awaitingResponse
  );
  const shouldRedirectToChat = useSelector(
    (state: any) => state.message.shouldRedirectToChat
  );

  // Redirect to chat ONLY when a new thread is created (not when navigating from existing chat)
  useEffect(() => {
    if (shouldRedirectToChat && threadData?.id) {
      router.push(`/chat/${threadData.id}`);
      dispatch(clearRedirectFlag()); // Clear flag after redirect
    }
  }, [shouldRedirectToChat, threadData?.id]);

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

    if (!isConnected) {
      Alert.alert(
        "Connection Error",
        "WebSocket is not connected. Please try again."
      );
      return;
    }

    // Store the message to be sent after thread creation
    setPendingInitialMessage(trimmedMessage);
    // Create a new thread
    const message = createMessage("chat", "create-thread", {});
    const success = sendMessage(message);

    if (success) {
      dispatch(setAwaitingResponse(true));
      // The actual message will be sent after thread is created
    } else {
      Alert.alert("Error", "Failed to send message. Please try again.");
      setPendingInitialMessage(null); // Clear pending message on failure
    }
  };

  const handleAttach = () => {
    Alert.alert("File attachment feature");
  };

  return (
    <CustomSafeAreaView>
      {/* This View will capture taps anywhere inside and dismiss the keyboard */}
      <View
        style={styles.outer}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => {
          Keyboard.dismiss();
        }}
      >
        <Topnav page="home" />

        <View style={styles.container}>
          <Text style={styles.title1}>Welcome {user?.firstName}</Text>
          <Text style={styles.title2}>How Can we help you?</Text>

          <ChatBox
            value={inputMessage}
            onChangeText={handleInputChange}
            onSend={handleSend}
            onAttach={handleAttach}
            placeholder="Ask me anything..."
            disabled={awaitingResponse}
          />

          <View style={styles.pillBox}>
            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                setInputMessage("Draft customer contract");
              }}
            >
              <Text style={styles.text}>Draft customer contract</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                setInputMessage("Start a company");
              }}
            >
              <Text style={styles.text}>Start a company</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                setInputMessage("Review redlines");
              }}
            >
              <Text style={styles.text}>Review redlines</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                setInputMessage("Protect my ip");
              }}
            >
              <Text style={styles.text}>Protect my ip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </CustomSafeAreaView>
  );
}

export default Home;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
    padding: 10,
  },
  title1: {
    fontSize: 24,
    fontWeight: "400",
    marginBottom: 20,
    textAlign: "center",
  },
  title2: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  pillBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    columnGap: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    marginVertical: 6,
  },
  text: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
});
