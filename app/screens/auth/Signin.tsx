import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { signInUser } from "../../store/authSlice";

export default function Signin() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const dispatch = useDispatch();
  const isSigningIn = useSelector((state: any) => state.auth.isSigningIn);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSignInPress = async () => {
    if (!isLoaded || isSigningIn) return;
    const result = await (dispatch as any)(
      signInUser({ signIn, setActive, emailAddress, password })
    );
    if (result.meta?.requestStatus === "fulfilled") {
      router.replace("/screens/home/Home");
    } else if (result.meta?.requestStatus === "rejected") {
      Alert.alert("Error", result.payload || "Failed to sign in");
    }
  };

  const onGooglePress = () => {
    Alert.alert("Google sign-in", "Wire this to your Google OAuth flow.");
  };

  return (
    <CustomSafeAreaView>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          {/* Wrapper to control vertical layout */}
          <View style={styles.inner}>
            {/* Top-left logo */}
            <View style={styles.header}>
              <Text style={styles.logo}>Inhouse</Text>
            </View>

            {/* Centered form card */}
            <View style={styles.card}>
              {/* Title & subtitle */}
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
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
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
                <Text style={styles.footerText}>Don’t have an account?</Text>
                <TouchableOpacity
                  onPress={() => router.push("/screens/auth/Signup")}
                >
                  <Text style={styles.footerLink}> Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom copyright */}
            <Text style={styles.copyright}>
              © 2025 Inhouse. All Rights Reserved
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  inner: {
    flex: 1,
    justifyContent: "space-between", // header at top, form mid, copyright bottom
  },

  // Header / logo
  header: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    textAlign: "left", // top-left
  },

  // Card (form) centered by maxWidth + inner flex layout
  card: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },

  // Google button
  googleButton: {
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 24,
  },
  googleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  googleIconText: {
    fontSize: 14,
  },
  googleText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Fields
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 999,
    fontSize: 15,
  },

  // Primary button
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#2F3C5A",
    borderRadius: 999,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButtonArrow: {
    fontWeight: "700",
  },

  // Footer (auth link)
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: "#6B7280",
  },
  footerLink: {
    fontSize: 13,
    color: "#1F6FEB",
    fontWeight: "600",
  },

  // Copyright bottom text
  copyright: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 32,
  },
});
