import { resetThreadData } from "@/store/messageSlice";
import { useAuth } from "@clerk/clerk-expo";
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

const SUPPORT_EMAIL = "support@inhouse.ai";

export const RegenerateAiResponse = () => {
  const dispatch = useDispatch();
  const { isSignedIn } = useAuth();
  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
  };

  const handleCreateNewThread = () => {
    dispatch(resetThreadData());
    if (isSignedIn) {
      navigate("/home/Home");
    } else {
      navigate("/try/LandingPage");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.alertBox}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.messageText}>
            We encountered an issue while processing your request. Please create
            a new thread or reach out to the customer support{" "}
            <Text style={styles.linkText} onPress={handleEmailPress}>
              {SUPPORT_EMAIL}
            </Text>
            .
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleCreateNewThread}
      >
        <Text style={styles.buttonText}>Create New Thread</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example usage
// <RegenerateAiResponse onCreateNewThread={() => console.log('Create new thread')} />

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 24,
    alignItems: "center",
  },
  alertBox: {
    width: "100%",
    backgroundColor: "#FFF5F5", // very light red
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FED7D7", // soft red border
    padding: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#E53E3E", // red
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  iconText: {
    color: "#E53E3E",
    fontWeight: "700",
    fontSize: 11,
  },
  messageText: {
    flex: 1,
    color: "#2D3748", // dark gray
    fontSize: 15,
    lineHeight: 20,
  },
  linkText: {
    color: "#3182CE", // link blue
    textDecorationLine: "underline",
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: "#1A2540", // dark navy
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default RegenerateAiResponse;
