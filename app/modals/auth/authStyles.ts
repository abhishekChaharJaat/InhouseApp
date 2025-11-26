import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  modalContainer: {
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    paddingTop: 20,
    paddingBottom: 24,
  },
  modalInner: {
    alignItems: "center",
  },
  // For screens with keyboard input (OTP, Forgot Password, Reset Password)
  modalContainerTall: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    paddingTop: 0,
    paddingBottom: 24,
    minHeight: "80%",
    justifyContent: "center",
  },

  // Header / logo
  header: {
    marginBottom: 24,
  },
  logo: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "left",
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
    color: "#1b2b48",
    fontFamily: "Lora",
    marginBottom: 24,

    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },

  emailHighlight: {
    color: "#111827",
    fontWeight: "600",
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
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
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

  // Forgot password
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 8,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: "#1F6FEB",
    fontWeight: "500",
  },
});
