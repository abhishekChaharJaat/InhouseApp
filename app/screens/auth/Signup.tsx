import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { useSignUp } from "@clerk/clerk-expo";
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
import { signUpUser } from "../../store/authSlice";

export default function Signup() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const dispatch = useDispatch();
  const isSigningUp = useSelector((state: any) => state.auth.isSigningUp);
  const signUpError = useSelector((state: any) => state.auth.signUpError);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (signUpError) {
      Alert.alert("Error", signUpError);
    }
  }, [signUpError]);

  const onSignUpPress = async () => {
    if (!isLoaded || isSigningUp) return;
    const result = await (dispatch as any)(
      signUpUser({
        signUp,
        setActive,
        firstName,
        lastName,
        emailAddress,
        password,
      })
    );
    if (result.meta?.requestStatus === "fulfilled") {
      router.replace("/screens/home/Home");
    }
  };

  const onGooglePress = () => {
    Alert.alert("Google sign-up", "Connect this to your Google OAuth flow.");
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
          {/* Outer layout: logo top, form center, copyright bottom */}
          <View style={styles.inner}>
            {/* Top-left logo */}
            <View style={styles.header}>
              <Text style={styles.logo}>Inhouse</Text>
            </View>

            {/* Centered form card */}
            <View style={styles.card}>
              {/* Title */}
              <Text style={styles.title}>Sign up to continue</Text>

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
                    <Text style={styles.eyeText}>
                      {showPassword ? "🙈" : "👁"}
                    </Text>
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
                <TouchableOpacity
                  onPress={() => router.push("/screens/auth/Signin")}
                >
                  <Text style={styles.footerLink}> Sign in</Text>
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
    justifyContent: "space-between", // header top, form middle, copyright bottom
  },

  // Header / logo
  header: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "left", // top-left
  },

  // Card (form)
  card: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
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

  // Password with eye
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 42,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 16,
  },

  // Primary button
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#2F3C5A", // matches sign-in style
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

  // Footer
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
