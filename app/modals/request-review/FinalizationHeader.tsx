import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

function FinalizationHeader() {
  const metadata = useSelector((state: any) => state.onboarding.userMetadata);
  const title = "Submit additional details to a lawyer";
  const name = metadata?.lawyer_info.name;
  const role = `${metadata?.lawyer_info.name} - Verified Inhouse Counsel`;
  const avatarUri = false; // put an image URL string here if you have one

  const processText = `${metadata?.lawyer_info.name} will review the work you did with the A.I. and any extra notes you leave in the box below and be in touch with any questions.`;

  const initials = name
    .split(" ")
    .map((n: any) => n[0])
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
          <View style={styles.roleRow}>
            {/* little “shield” icon substitute */}
            <Text style={styles.shield}>🛡️</Text>
            <Text style={styles.role}>{role}</Text>
          </View>
        </View>
      </View>

      {/* Process card */}
      <View style={styles.processCard}>
        <Text style={styles.processTitle}>Process</Text>
        <Text style={styles.processBody}>{processText}</Text>
      </View>
    </View>
  );
}

export default FinalizationHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "700",
    color: "#1b2b48",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  shield: {
    fontSize: 11,
    marginRight: 4,
  },
  role: {
    fontSize: 12,
    color: "#4A5568",
  },

  // Process styles
  processCard: {
    backgroundColor: "#F7FAFC",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  processTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  processBody: {
    fontSize: 13,
    color: "#4A5568",
    lineHeight: 20,
  },
});
