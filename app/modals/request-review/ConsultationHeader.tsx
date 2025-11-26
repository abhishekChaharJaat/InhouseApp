import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

function ConsultationHeader() {
  const title = "Advice from an Inhouse Attorney - $99";
  const name = "Stephen Routsi";
  const subtitle =
    "Stephen Routsi - Georgetown Law - educated attorney with 10+ years of experience helping businesses navigate complex legal matters";

  const avatarUri = false; // put real URL string here if you have one

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>
      {/* Lawyer row */}
      <View style={styles.row}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}

        <View style={styles.textBlock}>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Process card */}
      <View style={styles.processCard}>
        <Text style={styles.processTitle}>Process</Text>
        <Text style={styles.processStep}>
          1. Stephen will email you to schedule your 30-minute consultation and
          align on your goals.
        </Text>
        <Text style={styles.processStep}>
          2. Stephen will spend up to 15 minutes preparing for the call.
        </Text>
        <Text style={styles.processStep}>
          3. On the call, you'll talk through your business legal issue and
          leave with clear next steps.
        </Text>
      </View>
    </View>
  );
}

export default ConsultationHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "700",
    color: "#1b2b48",
    marginBottom: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D3748",
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#4A5568",
  },
  processCard: {
    backgroundColor: "#F7FAFC",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  processTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  processStep: {
    fontSize: 13,
    color: "#4A5568",
    marginBottom: 8,
  },
});
