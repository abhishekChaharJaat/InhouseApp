// ProDedicatedPlanCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProDedicatedPlanCard({
  docTitle = "AI Generated Document",
  priceLabel = "Access for $49",
}) {
  return (
    <View style={styles.card}>
      {/* LEFT SIDE */}
      <View style={styles.left}>
        <View style={styles.leftTop}>
          <Text style={styles.heading}>Access your AI generated document</Text>

          {/* Features list */}
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
                <Text style={styles.featureTextStrong}>
                  Customize for your needs –{" "}
                </Text>
                use our AI to edit your document for up to 24 hours.
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
                <Text style={styles.featureTextStrong}>Take it to go – </Text>
                Download in either Word or PDF format.
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
                <Text style={styles.featureTextStrong}>
                  Use how you need –{" "}
                </Text>
                Zero obligations and a full refund if you are not satisfied.
              </Text>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerRow}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color="#EAB308" // yellow-500
              style={{ marginRight: 6 }}
            />
            <Text style={styles.disclaimerText}>
              <Text style={styles.featureTextStrong}>Disclaimer – </Text>
              AI generated documents are for educational and informational
              purposes only and are not legal advice. Always consult a licensed
              attorney about your specific legal matter.
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {}}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{priceLabel}</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color="#000"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* RIGHT SIDE – Locked document preview */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

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

  featureTextStrong: {
    fontWeight: "600",
    color: "#000",
  },

  disclaimerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },

  disclaimerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    color: "#444444",
  },

  buttonRow: {
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

  /* RIGHT SIDE */

  right: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: "#F3F4F6",
  },

  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  previewHeaderText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },

  previewCard: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    minHeight: 220,
    overflow: "hidden",
  },

  previewContent: {
    opacity: 0.8,
  },

  previewTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },

  paragraphBlock: {
    marginBottom: 16,
  },

  line: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },

  chip: {
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    marginBottom: 16,
  },

  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  lockContent: {
    alignItems: "center",
  },

  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  lockTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  lockSubtitle: {
    fontSize: 14,
    color: "#4B5563",
  },
});
