import { DRAWER } from "@/app/constants";
import { closeReferralDrawer } from "@/app/helpers";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  const { show, drawerType, threadId } = useSelector(
    (state: any) => state.home.referralDrawerDetails
  );
  const dispatch = useDispatch();

  const handleSubmit = () => {
    console.log(name, email, details, threadId);
    // Add your submit logic here
  };

  const onClose = () => {
    closeReferralDrawer(dispatch);
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

              {/* Footer CTA */}
              {drawerType === DRAWER.CONSULTATION ? (
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.ctaText}>Proceed to Checkout | $99</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.ctaText}>Share for review</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.footerText}>
                By proceeding, you agree to our Terms of Service & Privacy
                Policy, and consent to receiving SMS messages. Your submissions
                are not Attorney–Client Privileged.
              </Text>
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
    borderRadius: 24,
    paddingVertical: 14,
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
  footerText: {
    fontSize: 12,
    color: "#718096",
    lineHeight: 16,
  },
});
