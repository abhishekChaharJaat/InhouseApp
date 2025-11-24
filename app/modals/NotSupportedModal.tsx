// NotSupportedModal.tsx
import { setShowNotSupportedModal } from "@/store/homeSlice";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";

const NotSupportedModal = () => {
  const dispatch = useDispatch();
  const showNotSupportedModal = useSelector(
    (state: any) => state.home.showNotSupportedModal
  );
  const handleClose = () => {
    dispatch(setShowNotSupportedModal(false));
  };

  return (
    <Modal
      visible={showNotSupportedModal}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        {/* Card (stop touch propagation) */}
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Optional top-right close icon */}
          <TouchableOpacity
            style={styles.closeIconWrapper}
            onPress={handleClose}
          >
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.iconWrapper}>
              <View className="iconCircle" style={styles.iconCircle}>
                <Text style={styles.iconText}>⚠️</Text>
              </View>
            </View>

            <Text style={styles.title}>
              We don&apos;t currently have lawyers servicing this legal area.
            </Text>

            <Text style={styles.description}>
              Sorry to report that we don&apos;t currently have any lawyers
              servicing this legal area, but I&apos;m happy to try to help you
              as an AI assistant.
            </Text>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.button}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: 500,
    maxWidth: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingTop: 32,
    paddingBottom: 0,
    overflow: "hidden",
  },
  closeIconWrapper: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIconText: {
    fontSize: 18,
    color: "#1B2B48",
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF3CD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 24,
    color: "#856404",
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1B2B48",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#686868",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#1B2B48",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default NotSupportedModal;
