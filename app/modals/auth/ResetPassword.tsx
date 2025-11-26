import { resetPassword, setShowAuthModal } from "@/store/authSlice";
import { useSignIn } from "@clerk/clerk-expo";
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

interface ResetPasswordProps {
  isModal?: boolean;
  emailAddress: string;
  onBack: () => void;
}

export default function ResetPassword({
  isModal,
  emailAddress,
  onBack,
}: ResetPasswordProps) {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isResettingPassword } = useSelector((state: any) => state.auth);

  const [resetCode, setResetCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  const onResetPasswordPress = async () => {
    if (!isLoaded || isResettingPassword || !resetCode || !newPassword) return;
    const result = await (dispatch as any)(
      resetPassword({ signIn, setActive, code: resetCode, newPassword })
    );
    if (result.meta?.requestStatus === "fulfilled") {
      dispatch(setShowAuthModal({ show: false, type: "" }));
      router.replace("/home/Home");
    } else if (result.meta?.requestStatus === "rejected") {
      Alert.alert("Error", result.payload || "Failed to reset password");
    }
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
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the code sent to{"\n"}
            <Text style={styles.emailHighlight}>{emailAddress}</Text>
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Verification code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#9CA3AF"
              value={resetCode}
              onChangeText={setResetCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>
                  {showNewPassword ? "🙈" : "👁"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isResettingPassword || !resetCode || !newPassword) &&
                styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={onResetPasswordPress}
            disabled={isResettingPassword || !resetCode || !newPassword}
          >
            {isResettingPassword ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Reset Password <Text style={styles.primaryButtonArrow}>▸</Text>
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.footerLink}>Back to Sign in</Text>
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
