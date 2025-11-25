// PaymentStatusCheckModal.tsx
import { PLANS } from "@/app/constants";
import { showReferralDrawer } from "@/app/helpers";
import { AppDispatch } from "@/store";
import {
  getPaymentStatus,
  resetPaymentStatus,
  setReferralFormData,
  setShowPaymentStatusCheckModal,
  storeReferral,
} from "@/store/homeSlice";
import { addLegalReviewMessage } from "@/store/messageSlice";
import { getUserMetadata } from "@/store/onboardingSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const TIMEOUT_SECONDS = 180; // 3 minutes

export default function PaymentStatusCheckModal() {
  const dispatch = useDispatch<AppDispatch>();
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showPaymentStatusCheckModal = useSelector(
    (state: any) => state.home.showPaymentStatusCheckModal
  );
  const paymentStatus = useSelector((state: any) => state.home.paymentStatus);
  const selectedPaymentPlanName = useSelector(
    (state: any) => state.home.selectedPaymentPlanName
  );
  const checkoutUrl = useSelector((state: any) => state.home.checkoutUrl);
  const userMetadata = useSelector(
    (state: any) => state.onboarding.userMetadata
  );
  const referralFormData = useSelector(
    (state: any) => state.home.referralFormData
  );
  const referralDrawerDetails = useSelector(
    (state: any) => state.home.referralDrawerDetails
  );

  useEffect(() => {
    if (showPaymentStatusCheckModal) {
      setTimeLeft(TIMEOUT_SECONDS);
      startTimer();
      startPolling();
    }

    return () => {
      stopTimer();
      stopPolling();
    };
  }, [showPaymentStatusCheckModal]);

  // Check if payment is successful
  useEffect(() => {
    // For consultation payments ($99), just check paymentStatus
    if (
      selectedPaymentPlanName === PLANS.LEGAL_CONSULTATION &&
      paymentStatus === "successful"
    ) {
      handleSuccess();
      return;
    }

    // For subscription payments, check both paymentStatus and subscription update
    if (
      paymentStatus === "successful" &&
      userMetadata?.subscription_type &&
      (userMetadata.subscription_type === PLANS.SUBSCRIBER_BUSINESS ||
        userMetadata.subscription_type === PLANS.SUBSCRIBER_ENTERPRISE)
    ) {
      // Payment confirmed and subscription updated
      handleSuccess();
    }
  }, [paymentStatus, userMetadata?.subscription_type, selectedPaymentPlanName]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPolling = () => {
    // Poll every 10 seconds
    pollingRef.current = setInterval(() => {
      if (checkoutUrl?.payment_id) {
        dispatch(getPaymentStatus(checkoutUrl.payment_id));
        dispatch(getUserMetadata({}) as any);
      }
    }, 10000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleSuccess = () => {
    stopTimer();
    stopPolling();

    // If this was a consultation payment ($99) and we have form data, store the referral
    if (
      selectedPaymentPlanName === PLANS.LEGAL_CONSULTATION &&
      referralFormData
    ) {
      dispatch(
        storeReferral({
          name: referralFormData.name || "",
          email: referralFormData.email || userMetadata?.email || "",
          phone: referralFormData.phone || "",
          thread_id: referralDrawerDetails?.threadId || null,
          description: referralFormData.description || "",
          state: referralFormData.state || "",
          type: "consultation",
        })
      );
      // Add legal review message to thread for instant display
      dispatch(addLegalReviewMessage());
      // Clear the form data
      dispatch(setReferralFormData(null));

      // Show the referral drawer with success screen after a delay
      setTimeout(() => {
        handleClose();
        // Re-open the referral drawer to show success
        showReferralDrawer(
          true,
          dispatch,
          "consultation",
          referralDrawerDetails?.threadId
        );
      }, 1500);
    } else {
      // Close after a brief delay to show success state
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    stopTimer();
    stopPolling();
    dispatch(setShowPaymentStatusCheckModal(false));
    dispatch(resetPaymentStatus());
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (checkoutUrl?.payment_id) {
        await dispatch(getPaymentStatus(checkoutUrl.payment_id));
      }
      await dispatch(getUserMetadata({}) as any);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPlanDisplayName = () => {
    if (selectedPaymentPlanName === PLANS.SUBSCRIBER_BUSINESS) {
      return "Inhouse Pro";
    }
    if (selectedPaymentPlanName === PLANS.SUBSCRIBER_ENTERPRISE) {
      return "Inhouse Counsel";
    }
    return "your plan";
  };

  // For consultation payments, we just check paymentStatus
  // For subscription payments, we also check userMetadata
  const isConsultationPayment =
    selectedPaymentPlanName === PLANS.LEGAL_CONSULTATION;

  const isPaymentSuccessful = isConsultationPayment
    ? paymentStatus === "successful"
    : paymentStatus === "successful" ||
      userMetadata?.subscription_type === PLANS.SUBSCRIBER_BUSINESS ||
      userMetadata?.subscription_type === PLANS.SUBSCRIBER_ENTERPRISE;

  if (!showPaymentStatusCheckModal) {
    return null;
  }

  return (
    <Modal
      visible={showPaymentStatusCheckModal}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          {isPaymentSuccessful ? (
            // Success state
            <View style={styles.content}>
              <View style={styles.successIconContainer}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={64}
                  color="#10B981"
                />
              </View>
              <Text style={styles.successTitle}>Payment Successful!</Text>
              <Text style={styles.successText}>
                Your payment has been processed successfully.
              </Text>
            </View>
          ) : (
            // Processing state
            <View style={styles.content}>
              <ActivityIndicator size="large" color="#1B2B48" />
              <Text style={styles.title}>Processing Payment</Text>
              <Text style={styles.subtitle}>
                Please wait while we confirm your payment...
              </Text>

              {/* Timer */}
              <View style={styles.timerContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>

              {/* Security note */}
              <View style={styles.securityNote}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={18}
                  color="#10B981"
                />
                <Text style={styles.securityText}>
                  Don't worry, your payment is secure.
                </Text>
              </View>

              {/* Manual refresh button */}
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleManualRefresh}
                disabled={isRefreshing}
                activeOpacity={0.7}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#1B2B48" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="refresh"
                      size={18}
                      color="#1B2B48"
                    />
                    <Text style={styles.refreshText}>Check Status</Text>
                  </>
                )}
              </TouchableOpacity>

              {timeLeft === 0 && (
                <Text style={styles.timeoutText}>
                  Taking longer than expected? Try refreshing the page or
                  contact support.
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  securityText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#6B7280",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  refreshText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#1B2B48",
  },
  timeoutText: {
    marginTop: 16,
    fontSize: 13,
    color: "#EF4444",
    textAlign: "center",
  },
  successIconContainer: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 8,
  },
  successText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 20,
  },
});
