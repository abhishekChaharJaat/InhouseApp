import { forgotPassword } from "@/store/authSlice";
import { useSignIn } from "@clerk/clerk-expo";
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

interface ForgotPasswordProps {
  isModal?: boolean;
  emailAddress: string;
  setEmailAddress: (email: string) => void;
  onBack: () => void;
}

export default function ForgotPassword({
  isModal,
  emailAddress,
  setEmailAddress,
  onBack,
}: ForgotPasswordProps) {
  const { signIn, isLoaded } = useSignIn();
  const dispatch = useDispatch();
  const { isResettingPassword } = useSelector((state: any) => state.auth);

  const onForgotPasswordPress = async () => {
    if (!isLoaded || isResettingPassword || !emailAddress) {
      if (!emailAddress) {
        Alert.alert("Error", "Please enter your email address");
      }
      return;
    }
    const result = await (dispatch as any)(
      forgotPassword({ signIn, emailAddress })
    );
    if (result.meta?.requestStatus === "rejected") {
      Alert.alert("Error", result.payload || "Failed to send reset code");
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={isModal ? styles.modalContainerTall : styles.container}
    >
      <View style={isModal ? styles.modalInner : styles.inner}>
        {!isModal && (
          <View style={styles.header}>
            <Text style={styles.logo}>Inhouse</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a code to reset your
            password
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isResettingPassword || !emailAddress) &&
                styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={onForgotPasswordPress}
            disabled={isResettingPassword || !emailAddress}
          >
            {isResettingPassword ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Send Code <Text style={styles.primaryButtonArrow}>▸</Text>
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.footerLink}>Back to Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>
          © 2025 Inhouse. All Rights Reserved
        </Text>
      </View>
    </ScrollView>
  );
}
