import { setShowAuthModal } from "@/store/authSlice";
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
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import Signin from "./Signin";
import Signup from "./Signup";

const { height, width } = Dimensions.get("window");

// Wave component at the top
const TopWave = () => (
  <View style={styles.waveContainer}>
    <Svg
      height="70"
      width={width}
      viewBox={`0 0 ${width} 70`}
      style={styles.wave}
    >
      <Defs>
        <LinearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#E8F4FD" />
          <Stop offset="50%" stopColor="#D4E9FA" />
          <Stop offset="100%" stopColor="#E0F0FC" />
        </LinearGradient>
      </Defs>
      <Path
        d={`
          M0,0
          L${width},0
          L${width},35
          Q${width * 0.75},60 ${width * 0.5},48
          Q${width * 0.25},36 0,55
          L0,0
          Z
        `}
        fill="url(#waveGradient)"
      />
      <Path
        d={`
          M0,0
          L${width},0
          L${width},25
          Q${width * 0.8},45 ${width * 0.5},35
          Q${width * 0.2},25 0,42
          L0,0
          Z
        `}
        fill="rgba(255,255,255,0.5)"
      />
    </Svg>
  </View>
);

export default function AuthModal() {
  const dispatch = useDispatch();
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const [authMode, setAuthMode] = useState<"signin" | "signup">();
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
              {/* Wave decoration at top */}
              <TopWave />

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                {/* Close button */}
                <View style={styles.handleContainer}>
                  <Pressable style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={22} color="#6B7280" />
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  waveContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  wave: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  content: {
    marginTop: 30,
    paddingBottom: 10,
  },
});
