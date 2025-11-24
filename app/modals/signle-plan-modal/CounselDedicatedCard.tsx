// CounselDedicatedCard.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CounselDedicatedCard({
  buttonText = "Upgrade to counsel | $349",
  title = "Loop in an Expert",
  priceBlurb = "Trusted legal network of 2,000+ lawyers specializing in 25+ practice areas",
}) {
  return (
    <View style={styles.card}>
      {/* LEFT SIDE */}
      <View style={styles.left}>
        <View style={styles.leftTop}>
          <Text style={styles.heading}>{title}</Text>

          {/* Features */}
          <View style={styles.featuresWrapper}>
            <View style={styles.featureRow}>
              <View style={styles.featureIconWrapper}>
                <MaterialCommunityIcons
                  name="check-bold"
                  size={14}
                  color="#027A48"
                />
              </View>
              <Text style={styles.featureText}>
                Inhouse will connect you with a licensed attorney experienced in
                your particular issue.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconWrapper}>
                <MaterialCommunityIcons
                  name="check-bold"
                  size={14}
                  color="#027A48"
                />
              </View>
              <Text style={styles.featureText}>
                The lawyer will review the chat and any extra details you
                provide.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconWrapper}>
                <MaterialCommunityIcons
                  name="check-bold"
                  size={14}
                  color="#027A48"
                />
              </View>
              <Text style={styles.featureText}>
                The lawyer will respond within 2 days to either set up a call or
                respond over email.
              </Text>
            </View>
          </View>
        </View>

        {/* Button + secure text */}
        <View style={styles.buttonBlock}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {}}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{buttonText}</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

          <Text style={styles.secureText}>
            This is a secure, one-click upgrade with your card on file.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column", // mobile-first; can wrap in a wider container for tablet
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderColor: "#E5E7EB",
  },

  /* LEFT */

  left: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  leftTop: {
    gap: 24,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#353535",
  },

  featuresWrapper: {
    marginTop: 8,
    gap: 12,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  featureIconWrapper: {
    width: 16,
    marginTop: 4,
    marginRight: 8,
    alignItems: "center",
  },

  featureText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    color: "#444444",
  },

  buttonBlock: {
    marginTop: 24,
  },

  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  secureText: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: "italic",
    color: "#4B5563",
  },

  /* RIGHT */

  right: {
    backgroundColor: "#ECF4EC",
    paddingVertical: 16,
    paddingHorizontal: 16,
    overflow: "hidden",
  },

  mapBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.16,
  },

  rightContent: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  rightBlurb: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 18,
    color: "#353535",
    fontWeight: "500",
    marginBottom: 8,
  },

  lawyersImg: {
    height: 180,
    width: "100%",
    marginBottom: 8,
  },

  ratingBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  ratingImg: {
    height: 18,
    width: 120,
    marginBottom: 4,
  },

  ratingText: {
    fontSize: 12,
    color: "#111827",
  },

  ratingStrong: {
    fontWeight: "600",
  },
});
