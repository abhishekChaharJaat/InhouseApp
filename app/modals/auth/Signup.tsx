import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { clearPendingThreadId, signUpUser } from "@/store/authSlice";
import { getUserMetadata } from "@/store/onboardingSlice";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
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
import OtpVerification from "./OtpVerification";

export default function Signup({ isModal, setAuthMode }: any) {
  const { signUp, isLoaded } = useSignUp();
  const dispatch = useDispatch();
  const { isSigningUp, pendingVerification, unauthThreadId } = useSelector(
    (state: any) => state.auth
  );

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded || isSigningUp) return;

    const result = await (dispatch as any)(
      signUpUser({
        signUp,
        firstName,
        lastName,
        emailAddress,
        password,
      })
    );
    if (result.meta?.requestStatus === "rejected") {
      Alert.alert("Signup Error", result.payload || "Failed to sign up");
    } else {
      // If there's a pending thread ID, call getUserMetadata first to migrate the thread
      if (unauthThreadId) {
        // Wait for getUserMetadata to complete (migrates anonymous thread to user)
        await (dispatch as any)(getUserMetadata({ threadId: unauthThreadId }));
        router.replace(`/chat/${unauthThreadId}`);
        dispatch(clearPendingThreadId());
      } else {
        router.replace("/home/Home");
      }
    }
  };

  const onGooglePress = () => {
    Alert.alert(
      "Google Sign-up Unavailable",
      "Google sign-up is currently unavailable. Please use email and password to create your account.",
      [{ text: "OK" }]
    );
  };

  // Show OTP verification screen
  if (pendingVerification) {
    return <OtpVerification isModal={isModal} emailAddress={emailAddress} />;
  }

  // Signup Form Screen
  const signupContent = (
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
          <Text style={styles.title}>Sign up to continue</Text>

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

          {/* First name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>First name</Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Last name</Text>
            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>

          {/* Password with eye toggle */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSigningUp && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={onSignUpPress}
            disabled={isSigningUp}
          >
            {isSigningUp ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Continue <Text style={styles.primaryButtonArrow}>▸</Text>
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => setAuthMode("signin")}>
              <Text style={styles.footerLink}> Sign in</Text>
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
    return signupContent;
  }

  return (
    <CustomSafeAreaView>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {signupContent}
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
}
