import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import {
  resetPendingPasswordReset,
  setShowAuthModal,
  signInUser,
} from "@/store/authSlice";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { authStyles as styles } from "./authStyles";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

export default function Signin({ isModal, setAuthMode }: any) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isSigningIn, pendingPasswordReset } = useSelector(
    (state: any) => state.auth
  );

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);

  const onSignInPress = async () => {
    if (!isLoaded || isSigningIn) return;
    const result = await (dispatch as any)(
      signInUser({ signIn, setActive, emailAddress, password })
    );
    if (result.meta?.requestStatus === "fulfilled") {
      dispatch(setShowAuthModal({ show: false, type: "" }));
      router.replace("/home/Home");
    } else if (result.meta?.requestStatus === "rejected") {
      Alert.alert("Error", result.payload || "Failed to sign in");
    }
  };

  const onBackToSignin = () => {
    setShowForgotPassword(false);
    dispatch(resetPendingPasswordReset());
  };

  const onGooglePress = () => {
    Alert.alert(
      "Google Sign-in Unavailable",
      "Google sign-in is currently unavailable. Please use email and password to sign in.",
      [{ text: "OK" }]
    );
  };

  // Show Reset Password screen (after code is sent)
  if (pendingPasswordReset) {
    return (
      <ResetPassword
        isModal={isModal}
        emailAddress={emailAddress}
        onBack={onBackToSignin}
      />
    );
  }

  // Show Forgot Password screen
  if (showForgotPassword) {
    return (
      <ForgotPassword
        isModal={isModal}
        emailAddress={emailAddress}
        setEmailAddress={setEmailAddress}
        onBack={onBackToSignin}
      />
    );
  }

  // Sign in screen
  const signinContent = (
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
          <Text style={styles.title}>Sign in to your account</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please sign in to continue
          </Text>

          {/* Google button */}
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.9}
            onPress={onGooglePress}
          >
            <View style={styles.googleContent}>
              <Image
                source={{
                  uri: "https://www.google.com/favicon.ico",
                }}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email field */}
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
            />
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Forgot password link */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => setShowForgotPassword(true)}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSigningIn && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={onSignInPress}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Continue <Text style={styles.primaryButtonArrow}>▸</Text>
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer - sign up link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => setAuthMode("signup")}>
              <Text style={styles.footerLink}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>
          © 2025 Inhouse. All Rights Reserved
        </Text>
      </View>
    </ScrollView>
  );

  if (isModal) {
    return signinContent;
  }

  return (
    <CustomSafeAreaView>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {signinContent}
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
}
