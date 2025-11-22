// SinglePlanModal.tsx
import { PLANS } from "@/app/constants";
import { showSinglePlanModal } from "@/app/helpers";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import CounselDedicatedCard from "./CounselDedicatedCard";
import ProDedicatedPlanCard from "./ProDedicatedPlan";

export default function SinglePlanModal() {
  const dispatch = useDispatch();

  const singlePlanModal = useSelector(
    (state: any) => state.home.singlePlanModal
  );

  const handleClose = () => {
    showSinglePlanModal(false, dispatch, null);
  };

  return (
    <Modal
      visible={singlePlanModal.show}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      {/* Dimmed background */}
      <View style={styles.backdrop}>
        {/* Stop touches from closing when tapping card */}
        <TouchableWithoutFeedback>
          <View style={styles.sheetContainer}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {singlePlanModal?.planType === PLANS.AI_DOC && (
              <ProDedicatedPlanCard />
            )}
            {singlePlanModal?.planType === PLANS.LAWYER_FINALLIZATION && (
              <CounselDedicatedCard />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end", // stick to bottom
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
