import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setShowAuthModal } from "@/store/authSlice";
import Signin from "./Signin";
import Signup from "./Signup";
const { height } = Dimensions.get("window");

export default function AuthModal() {
  const dispatch = useDispatch();
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const showAuthModal = useSelector((state: any) => state.auth.showAuthModal);

  React.useEffect(() => {
    setAuthMode(showAuthModal.type);
  }, [showAuthModal.type]);

  React.useEffect(() => {
    if (showAuthModal.show) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showAuthModal.show]);

  const onClose = () => {
    dispatch(setShowAuthModal({ show: false, type: authMode }));
  };

  return (
    <Modal
      visible={showAuthModal.show}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                {/* Close handle */}
                <View style={styles.handleContainer}>
                  <Pressable style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={30} color="#96999dff" />
                  </Pressable>
                </View>

                {/* Content */}
                <View style={styles.content}>
                  {authMode === "signin" ? (
                    <Signin setAuthMode={setAuthMode} isModal={true} />
                  ) : (
                    <Signup setAuthMode={setAuthMode} isModal={true} />
                  )}
                </View>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 24,
    zIndex: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
});
