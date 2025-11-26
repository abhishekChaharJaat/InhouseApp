import { DRAWER } from "@/app/constants";
import { closeReferralDrawer, handleConsultationCheckout } from "@/app/helpers";
import { AppDispatch } from "@/store";
import {
  resetStoreReferralStatus,
  setReferralFormData,
  storeReferral,
} from "@/store/homeSlice";
import { addLegalReviewMessage } from "@/store/messageSlice";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ConsultationHeader from "./ConsultationHeader";
import FinalizationHeader from "./FinalizationHeader";
import PersonalInjuryHeader from "./PersonalInjouryHeader";

function Referraldrawer() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [reviewRequested, setReviewRequested] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { show, drawerType, threadId } = useSelector(
    (state: any) => state.home.referralDrawerDetails
  );
  const checkoutUrlStatus = useSelector(
    (state: any) => state.home.checkoutUrlStatus
  );
  const storeReferralStatus = useSelector(
    (state: any) => state.home.storeReferralStatus
  );
  const userMetadata = useSelector(
    (state: any) => state.onboarding.userMetadata
  );
  const threadData = useSelector((state: any) => state.message.threadData);

  const isLoading =
    checkoutUrlStatus === "loading" || storeReferralStatus === "loading";

  useEffect(() => {
    if (!show) return;
    let legalReviewMessages = threadData?.messages.filter(
      (msg: any) => msg.message_type === "legal_review_message"
    );
    let documentGenerated = threadData?.messages.some(
      (msg: any) => msg.message_type === "document_generated"
    );
    // console.log("legalReviewMessages ", legalReviewMessages);
    // console.log("documentGenerated ", documentGenerated);
    if (!legalReviewMessages || legalReviewMessages.length < 1) {
      setReviewRequested(false);
      return;
    }
    if (legalReviewMessages?.length === 1 && !documentGenerated) {
      setReviewRequested(true);
      return;
    }
    if (legalReviewMessages?.length > 1 && documentGenerated) {
      setReviewRequested(true);
      return;
    }
    setReviewRequested(false);
  }, [show, threadData]);

  // Show success screen and add legal review message when storeReferral succeeds
  useEffect(() => {
    if (storeReferralStatus === "success") {
      setReviewRequested(true);
      // Add legal review message to thread for instant display
      dispatch(addLegalReviewMessage());
    }
  }, [storeReferralStatus]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!show) {
      setName("");
      setEmail("");
      setDetails("");
      setReviewRequested(false);
      dispatch(resetStoreReferralStatus());
    }
  }, [show]);

  // For finalization/free - direct submit (no payment needed)
  const handleDirectSubmit = () => {
    const userName =
      name.trim() ||
      `${userMetadata?.first_name || ""} ${
        userMetadata?.last_name || ""
      }`.trim();

    dispatch(
      storeReferral({
        name: userName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        phone: "",
        thread_id: threadId,
        description: details,
        state: userMetadata?.individual_info?.state_of_residence || "",
        type: "document_finalization",
      })
    );
  };

  // For consultation checkout ($99) - save form data and proceed to payment
  const onConsultationCheckout = () => {
    // Save form data to redux for use after payment success
    dispatch(
      setReferralFormData({
        name: name,
        email: user?.emailAddresses[0]?.emailAddress || "",
        phone: "",
        description: details,
        state: userMetadata?.individual_info?.state_of_residence || "",
      })
    );

    handleConsultationCheckout({
      dispatch,
      threadId,
    });
  };

  const onClose = () => {
    closeReferralDrawer(dispatch);
    dispatch(resetStoreReferralStatus());
  };

  // Get success message based on drawer type
  const getSuccessMessage = () => {
    const lawyerName = userMetadata?.lawyer_info?.name || "Stephen Routsi";
    const userEmail = email || userMetadata?.email || "your email";

    if (drawerType === DRAWER.CONSULTATION) {
      return {
        title: "Your purchase is complete!",
        description: `${lawyerName} will reach out to you on ${userEmail} to schedule your consultation within 1 business day.`,
      };
    } else if (drawerType === DRAWER.FINALIZATION) {
      return {
        title: "Finalization Requested!",
        description: `${lawyerName} will reach out to you on ${userEmail} to finalize your document within 2 business days.`,
      };
    } else {
      return {
        title: "Thank You!",
        description: `Morgan & Morgan will reach out to you on ${userEmail} or your SMS within 2 business days to discuss your case.`,
      };
    }
  };

  return (
    <Modal
      visible={show}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* backdrop for closing */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* bottom sheet */}
        <View style={styles.bottomContainer}>
          <View style={styles.drawer}>
            {/* Top strip/handle to close */}
            <TouchableOpacity onPress={onClose} style={styles.handleContainer}>
              <View style={styles.handle} />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {reviewRequested ? (
                // Success Screen
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={64}
                      color="#027A48"
                    />
                  </View>
                  <Text style={styles.successTitle}>
                    {getSuccessMessage().title}
                  </Text>
                  <Text style={styles.successDescription}>
                    {getSuccessMessage().description}
                  </Text>
                  <TouchableOpacity style={styles.ctaButton} onPress={onClose}>
                    <Text style={styles.ctaText}>OK, got it</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Header */}
                  {drawerType === DRAWER.FREE && <PersonalInjuryHeader />}
                  {drawerType === DRAWER.CONSULTATION && <ConsultationHeader />}
                  {drawerType === DRAWER.FINALIZATION && <FinalizationHeader />}

                  {/* Name / Email when not signed in */}
                  {!isSignedIn && (
                    <>
                      <Text style={styles.label}>Your name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#A0AEC0"
                      />

                      <Text style={styles.label}>Email address</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#A0AEC0"
                      />
                    </>
                  )}

                  {/* Details textarea */}
                  <Text style={styles.label}>
                    Please provide details about your situation{" "}
                    <Text style={styles.optional}>(optional)</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    textAlignVertical="top"
                    placeholder="Outline your concern for personalized legal support"
                    value={details}
                    onChangeText={setDetails}
                    placeholderTextColor="#A0AEC0"
                  />

                  {/* Footer CTA - Different based on user plan and drawer type */}
                  {drawerType === DRAWER.CONSULTATION ? (
                    // Non-enterprise users see $99 checkout for consultation
                    <TouchableOpacity
                      style={[
                        styles.ctaButton,
                        isLoading && styles.ctaButtonDisabled,
                      ]}
                      onPress={onConsultationCheckout}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.ctaText}>
                          Proceed to Checkout | $99
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    // Enterprise users or finalization/free - direct submit
                    <TouchableOpacity
                      style={[
                        styles.ctaButton,
                        isLoading && styles.ctaButtonDisabled,
                      ]}
                      onPress={handleDirectSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.ctaText}>Share for review</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  <Text style={styles.footerText}>
                    By proceeding, you agree to our Terms of Service & Privacy
                    Policy, and consent to receiving SMS messages. Your
                    submissions are not Attorney–Client Privileged.
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default Referraldrawer;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  drawer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 12,
  },
  price: {
    color: "#1A202C",
  },
  attorneyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDF2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarInitials: {
    fontWeight: "600",
    color: "#2D3748",
  },
  attorneyInfo: {
    flex: 1,
  },
  attorneyName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 2,
  },
  attorneySubtitle: {
    fontSize: 13,
    color: "#4A5568",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3748",
    marginBottom: 6,
    marginTop: 10,
  },
  optional: {
    fontWeight: "400",
    color: "#A0AEC0",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2D3748",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 120,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: "#1b2b48",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  footerText: {
    fontSize: 12,
    color: "#718096",
    lineHeight: 16,
  },
  // Success screen styles
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1B2B48",
    marginBottom: 16,
    textAlign: "center",
  },
  successDescription: {
    fontSize: 16,
    color: "#353535",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
});
