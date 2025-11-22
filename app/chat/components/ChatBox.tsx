import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatBox({
  value,
  onChangeText,
  onSend,
  onAttach,
  placeholder = "Review a lease for...",
  disabled = false,
}: any) {
  const isDisabled = disabled || value.trim().length === 0;
  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, disabled && styles.cardDisabled]}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          editable={!disabled}
        />

        <View style={styles.actionsRow}>
          {/* Paperclip on the left */}
          <TouchableOpacity
            onPress={onAttach}
            style={styles.circleButtonOutline}
            activeOpacity={0.8}
            disabled={disabled}
          >
            <Feather
              name="paperclip"
              size={18}
              color={disabled ? "#D1D5DB" : "#4B5563"}
            />
          </TouchableOpacity>

          {/* Spacer pushes send icon to the right */}
          <View style={{ flex: 1 }} />

          <TouchableOpacity
            onPress={onSend}
            style={
              isDisabled
                ? styles.circleButtonDisabled
                : styles.circleButtonSolid
            }
            activeOpacity={0.8}
            disabled={disabled}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
    alignSelf: "stretch",
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1, // thin border
    borderColor: "#d8d8d8ff", // light gray border
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    opacity: 0.9,
  },
  input: {
    minHeight: 60,
    maxHeight: 120,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top", // 👈 for proper multiline alignment
  },
  inputDisabled: {
    color: "#9CA3AF",
  },

  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  circleButtonOutline: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonSolid: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1b2b48",
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonDisabled: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1D5DB",
  },
  sendIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});
