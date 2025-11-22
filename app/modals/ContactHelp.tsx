import { setShowContactHelp } from "@/store/homeSlice";
import React from "react";
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
const ContactHelp = () => {
  const dispatch = useDispatch();

  const showContactHelp = useSelector(
    (state: any) => state.home.showContactHelp
  );
  const handleEmailPress = () => {
    Linking.openURL("mailto:support@inhouse.ai");
  };
  const onClose = () => {
    dispatch(setShowContactHelp(false));
  };

  return (
    <Modal
      visible={showContactHelp}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>?</Text>
          </View>

          <Text style={styles.title}>Looking for help?</Text>

          <Text style={styles.subtitle}>
            Drop an email to{" "}
            <Text style={styles.link} onPress={handleEmailPress}>
              support@inhouse.ai
            </Text>
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 40,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 8,
    padding: 4,
  },
  closeText: {
    fontSize: 30,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
  link: {
    color: "#337ab7",
    textDecorationLine: "underline",
  },
});

export default ContactHelp;
