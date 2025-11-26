// @ts-nocheck
import ChatBox from "@/app/chat/chatpage-components/ChatBox";
import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { RootState } from "@/store";
import { clearRedirectFlag, setChatInputMessage } from "@/store/messageSlice";
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
import Topnav from "../navs/Topnav";
import {
  createThreadMessage,
  sendWebSocketMessage,
  setPendingInitialMessage,
} from "../providers/wsClient";

function Home() {
  const { user } = useUser();
  const dispatch = useDispatch();
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState("");

  // Get threadData and redirect flag from Redux
  const threadData = useSelector(
    (state: RootState) => state.message.threadData
  );
  const shouldRedirectToChat = useSelector(
    (state: RootState) => state.message.shouldRedirectToChat
  );

  const handleInputChange = (text: string) => {
    setInputMessage(text);
    dispatch(setChatInputMessage(text));
  };

  const handleSend = () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) {
      Alert.alert("Alert", "Please enter a message");
      return;
    }
    // Store the pending message
    setPendingInitialMessage(trimmedMessage);
    // Create thread via WebSocket
    const message = createThreadMessage();
    const success = sendWebSocketMessage(null, message);
    if (success) {
      console.log("Thread creation request sent");
    }
  };
  const handleAttach = () => {
    Alert.alert("Feature Unavailable", "File attachment coming soon.");
  };

  // Redirect to chat page when thread is created
  useEffect(() => {
    if (shouldRedirectToChat && threadData?.id) {
      console.log("Redirecting to thread:", threadData.id);
      router.push(`/chat/${threadData.id}`);
      dispatch(clearRedirectFlag());
    }
  }, [shouldRedirectToChat, threadData?.id]);

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
            placeholder="Ask me legal question..."
            disabled={false}
          />

          <View style={styles.pillBox}>
            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                const msg = "Draft customer contract";
                setInputMessage(msg);
                dispatch(setChatInputMessage(msg));
              }}
            >
              <Text style={styles.text}>Draft customer contract</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                const msg = "Start a company";
                setInputMessage(msg);
                dispatch(setChatInputMessage(msg));
              }}
            >
              <Text style={styles.text}>Start a company</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                const msg = "Review redlines";
                setInputMessage(msg);
                dispatch(setChatInputMessage(msg));
              }}
            >
              <Text style={styles.text}>Review redlines</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pill}
              onPress={() => {
                const msg = "Protect my ip";
                setInputMessage(msg);
                dispatch(setChatInputMessage(msg));
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
    fontFamily: "Lora",
    fontWeight: "400",
    marginBottom: 20,
    textAlign: "center",
    color: "#1b2b48",
  },
  title2: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
    color: "#1b2b48",
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
