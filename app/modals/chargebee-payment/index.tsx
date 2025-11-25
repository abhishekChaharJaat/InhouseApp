// ChargebeePaymentModal.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  closeChargebeePaymentModal,
  getPaymentStatus,
  resetPaymentStatus,
  setShowPaymentStatusCheckModal,
} from "@/store/homeSlice";
import { AppDispatch } from "@/store";
import { getUserMetadata } from "@/store/onboardingSlice";

export default function ChargebeePaymentModal() {
  const dispatch = useDispatch<AppDispatch>();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const openChargebeePaymentModal = useSelector(
    (state: any) => state.home.openChargebeePaymentModal
  );
  const checkoutUrl = useSelector((state: any) => state.home.checkoutUrl);
  const paymentStatus = useSelector((state: any) => state.home.paymentStatus);

  // Start polling for payment status when modal opens
  useEffect(() => {
    if (openChargebeePaymentModal && checkoutUrl?.payment_id) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [openChargebeePaymentModal, checkoutUrl?.payment_id]);

  // Handle payment success
  useEffect(() => {
    if (paymentStatus === "successful") {
      handlePaymentSuccess();
    }
  }, [paymentStatus]);

  const startPolling = () => {
    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (checkoutUrl?.payment_id) {
        dispatch(getPaymentStatus(checkoutUrl.payment_id));
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handlePaymentSuccess = () => {
    stopPolling();
    dispatch(closeChargebeePaymentModal());
    dispatch(setShowPaymentStatusCheckModal(true));
    // Refresh user metadata to get updated subscription
    dispatch(getUserMetadata({}) as any);
  };

  const handleClose = () => {
    stopPolling();
    dispatch(closeChargebeePaymentModal());
    dispatch(resetPaymentStatus());
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Guard against undefined url
    if (!url || typeof url !== "string") {
      return;
    }

    const lowerUrl = url.toLowerCase();

    // Check if redirected to success URL or payment completed
    if (
      lowerUrl.includes("payment_success") ||
      lowerUrl.includes("thankyou") ||
      lowerUrl.includes("success")
    ) {
      handlePaymentSuccess();
    }

    // Check for cancellation
    if (lowerUrl.includes("cancel") || lowerUrl.includes("cancelled")) {
      handleClose();
    }
  };

  if (!openChargebeePaymentModal || !checkoutUrl?.url) {
    return null;
  }

  return (
    <Modal
      visible={openChargebeePaymentModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1B2B48" />
              <Text style={styles.loadingText}>Loading checkout...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: checkoutUrl.url }}
            style={styles.webView}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={["*"]}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
            }}
          />
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={14} color="#6B7280" />
          <Text style={styles.securityText}>
            Secure payment powered by Chargebee
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  securityText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#6B7280",
  },
});
