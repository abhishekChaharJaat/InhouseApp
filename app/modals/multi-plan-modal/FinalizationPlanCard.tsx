import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";

type Props = {
  onSelect?: () => void;
  style?: ViewStyle;
};

const FinalizationPlanCard: React.FC<Props> = ({ onSelect, style }) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.planTitle}>Attorney-Finalized</Text>
      <View style={styles.badgeWrapper}>
        <Text style={styles.price}>$349</Text>
        <Text style={styles.badge}>$2,200 less than a law firm</Text>
      </View>

      <Text style={styles.subHeaderBold}>
        Get instant access to the AI-Smart Draft and receive an expert-finalized
        version in 2 days.
      </Text>

      <TouchableOpacity style={styles.buttonFilled} onPress={onSelect}>
        <Text style={styles.buttonFilledText}>Attorney Finalized</Text>
      </TouchableOpacity>

      <View style={styles.featureList}>
        <Text style={styles.featureIntro}>
          Everything included in AI-Document, plus:
        </Text>
        <Text style={styles.feature}>
          ✅ Your AI document reviewed, analyzed and finalized by an Inhouse
          attorney.
        </Text>
        <Text style={styles.feature}>
          ✅ Communicate with the lawyer to answer your questions and ensure the
          work meets your business objectives.
        </Text>
        <Text style={styles.feature}>
          ✅ Guaranteed to match the quality of a top firm.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 260,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: "#FCE7F3",
    color: "#BE185D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  price: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },
  subHeaderBold: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 18,
  },
  buttonFilled: {
    backgroundColor: "#1B2B48",
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 18,
  },
  buttonFilledText: {
    textAlign: "center",
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  featureList: {
    gap: 8,
  },
  featureIntro: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  feature: {
    fontSize: 13,
    color: "#1B2B48",
    lineHeight: 18,
  },
});

export default FinalizationPlanCard;
