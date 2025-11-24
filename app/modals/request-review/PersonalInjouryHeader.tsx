import React from "react";
import { StyleSheet, Text, View } from "react-native";

function PersonalInjuryHeader() {
  const title = "Submit additional details to a lawyer";
  const firmShort = "MM";
  const firmLine =
    "This issue is a good match for Morgan & Morgan – the nation’s largest plaintiff side law firm";

  const processText =
    "A member of the Inhouse legal team will review the work you did with the A.I. and any extra notes you leave in the box below and be in touch with any questions.";

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Firm row */}
      <View style={styles.row}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>{firmShort}</Text>
        </View>

        <Text style={styles.firmLine}>{firmLine}</Text>
      </View>

      {/* Personal Injury Process Card */}
      <View style={styles.processCard}>
        <Text style={styles.processTitle}>Process</Text>
        <Text style={styles.processBody}>{processText}</Text>
      </View>
    </View>
  );
}

export default PersonalInjuryHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#1b2b48",
    paddingRight: 40,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFD54A",
  },
  firmLine: {
    flex: 1,
    fontSize: 13,
    color: "#2D3748",
  },

  // 🔹 Personal Injury Process Styles
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
