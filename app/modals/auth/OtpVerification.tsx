import {
  resetPendingVerification,
  setShowAuthModal,
  verifyOtp,
} from "@/store/authSlice";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { authStyles as styles } from "./authStyles";

interface OtpVerificationProps {
  isModal?: boolean;
  emailAddress: string;
}

export default function OtpVerification({
  isModal,
  emailAddress,
}: OtpVerificationProps) {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isVerifyingOtp } = useSelector((state: any) => state.auth);

  const [otpCode, setOtpCode] = React.useState("");

  const onVerifyOtpPress = async () => {
    if (!isLoaded || isVerifyingOtp || !otpCode) return;
    const result = await (dispatch as any)(
      verifyOtp({
        signUp,
        setActive,
        code: otpCode,
      })
    );
    if (result.meta?.requestStatus === "fulfilled") {
      dispatch(setShowAuthModal({ show: false, type: "" }));
      router.replace("/home/Home");
    } else if (result.meta?.requestStatus === "rejected") {
      Alert.alert("Error", result.payload || "Invalid verification code");
    }
  };

  const onBackToSignup = () => {
    dispatch(resetPendingVerification());
    setOtpCode("");
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={isModal ? styles.modalContainer : styles.container}
    >
      <View style={isModal ? styles.modalInner : styles.inner}>
        {!isModal && (
          <View style={styles.header}>
            <Text style={styles.logo}>Inhouse</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to{"\n"}
            <Text style={styles.emailHighlight}>{emailAddress}</Text>
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Verification code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#9CA3AF"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isVerifyingOtp || !otpCode) && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={onVerifyOtpPress}
            disabled={isVerifyingOtp || !otpCode}
          >
            {isVerifyingOtp ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Verify <Text style={styles.primaryButtonArrow}>▸</Text>
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={onBackToSignup}>
              <Text style={styles.footerLink}> Go back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!isModal && (
          <Text style={styles.copyright}>
            © 2025 Inhouse. All Rights Reserved
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
