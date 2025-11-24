import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AIDocumentPlanCard from "./AiDocmentPlanCard";
import FinalizationPlanCard from "./FinalizationPlanCard";
import { useSelector, useDispatch } from "react-redux";
import { setShowMultiPlanModal } from "@/store/homeSlice";

const onSelectAIDoc = () => {};
const onSelectAttorney = () => {};

const MultiPlanModal = () => {
  const dispatch = useDispatch();

  const showMultiPlanModal = useSelector(
    (state: any) => state.home.showMultiPlanModal
  );

  const onClose = () => {
    dispatch(setShowMultiPlanModal(false));
  };
  return (
    <Modal visible={showMultiPlanModal} transparent animationType="slide">
      <View style={styles.overlay}>
        {/* Dim background */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Bottom sheet dialog */}
        <View style={styles.dialog}>
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={26} color="#96999dff" />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>
              Two ways to take your document to the finish line
            </Text>

            <View style={styles.planRow}>
              <FinalizationPlanCard onSelect={onSelectAttorney} />
              <AIDocumentPlanCard onSelect={onSelectAIDoc} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  dialog: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
    color: "#1B2B48",
    paddingHorizontal: 24,
    fontStyle: "italic",
  },
  planRow: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
});

export default MultiPlanModal;
