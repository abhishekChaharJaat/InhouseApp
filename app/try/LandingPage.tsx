// @ts-nocheck
import { RootState } from "@/store";
import { clearRedirectFlag } from "@/store/messageSlice";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ChatBox from "../chat/chatpage-components/ChatBox";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import Topnav from "../navs/Topnav";
import {
  createThreadMessage,
  sendWebSocketMessage,
  setPendingInitialMessage,
} from "../providers/wsClient";

const LandingPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState("");

  const awaitingResponse = useSelector(
    (state: RootState) => state.message.awaitingResponse
  );
  const threadData = useSelector(
    (state: RootState) => state.message.threadData
  );
  const shouldRedirectToChat = useSelector(
    (state: RootState) => state.message.shouldRedirectToChat
  );

  const handleInputChange = (text: string) => {
    setInputMessage(text);
  };

  const handleSend = () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) {
      Alert.alert("Error", "Please enter a message");
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

  // Redirect to chat page when thread is created (same pattern as Home page)
  useEffect(() => {
    if (shouldRedirectToChat && threadData?.id) {
      dispatch(clearRedirectFlag());
      console.log("✅ Redirecting to thread:", threadData.id);
      router.push(`/chat/${threadData.id}`);
      console.log("---Thread Created Redirect to /chat page");
    }
  }, [shouldRedirectToChat, threadData?.id]);

  // Attachment handler
  const handleAttach = () => {
    Alert.alert("Feature Unavailable", "File attachment coming soon.");
  };

  return (
    <CustomSafeAreaView>
      <Topnav page="try" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.heroSection}>
              {/* Header */}
              <Text style={styles.title}>
                AI-powered legal help, backed by real lawyers
              </Text>

              {/* Subtitle */}
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>
                  • Get advice and documents from the world's most trusted AI
                  legal platform, and
                </Text>
                <Text style={styles.subtitle}>
                  • loop in a lawyer for total confidence before sign-off.
                </Text>
              </View>

              {/* ChatBox */}
              <View style={styles.chatBoxContainer}>
                <ChatBox
                  value={inputMessage}
                  onChangeText={handleInputChange}
                  onSend={handleSend}
                  onAttach={handleAttach}
                  placeholder="Ask me any legal questions..."
                  disabled={awaitingResponse}
                />
              </View>
              <View style={styles.pillBox}>
                <TouchableOpacity style={styles.pill} onPress={() => {}}>
                  <Text style={styles.text}>Draft customer contract</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pill} onPress={() => {}}>
                  <Text style={styles.text}>Start a company</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pill} onPress={() => {}}>
                  <Text style={styles.text}>Review redlines</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pill} onPress={() => {}}>
                  <Text style={styles.text}>Protect my ip</Text>
                </TouchableOpacity>
              </View>

              {/* Info text */}
              <Text style={styles.infoText}>
                Try Inhouse AI for free - no credit card required
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B2B48",
    textAlign: "center",
    lineHeight: 38,
    fontStyle: "italic",
    marginBottom: 8,
  },
  subtitleContainer: {
    gap: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#1B2B48",
    textAlign: "center",
    lineHeight: 24,
  },
  chatBoxContainer: {
    width: "100%",
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
  },
  pillBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
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
