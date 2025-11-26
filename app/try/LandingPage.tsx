// @ts-nocheck
import { RootState } from "@/store";
import { clearRedirectFlag } from "@/store/messageSlice";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
import Trustmakers from "./TrustMakersCarousel";

const LandingPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
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
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#3F65A9"]}
                tintColor="#3F65A9"
                progressViewOffset={-50}
              />
            }
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
                  legal platform.
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
                <Trustmakers />
              </View>
            </View>
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                AI can make mistakes, always consult a lawyer. Read our{" "}
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL("https://www.inhouse.ai/terms-of-service")
                  }
                >
                  Terms
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL("https://www.inhouse.ai/privacy-policy")
                  }
                >
                  Privacy Policy
                </Text>
                .
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
    paddingHorizontal: 10,
  },
  heroSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B2B48",
    textAlign: "center",
    lineHeight: 38,
    fontFamily: "Georgia",
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 14,
    color: "#1B2B48",
    textAlign: "center",
    fontFamily: "Lora",
    lineHeight: 24,
  },
  chatBoxContainer: {
    width: "100%",
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
  },

  footerContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    color: "#838282ff",
    fontSize: 13,
    lineHeight: 20,
  },
  link: {
    textDecorationLine: "underline",
    color: "#3F65A9",
  },
});
