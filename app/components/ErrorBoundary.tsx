import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Show alert with error details
    Alert.alert(
      "App Error",
      `${error.name}: ${
        error.message
      }\n\nComponent Stack: ${errorInfo.componentStack?.slice(0, 200)}...`,
      [
        {
          text: "Copy Details",
          onPress: () => {
            console.log("Full Error:", error);
            console.log("Error Info:", errorInfo);
          },
        },
        {
          text: "Dismiss",
          style: "cancel",
        },
      ]
    );

    // Log full error to console for debugging
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>An error occurred in the app</Text>
          </View>

          <ScrollView style={styles.errorContainer}>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorText}>
              {error?.name}: {error?.message}
            </Text>

            {errorInfo?.componentStack && (
              <>
                <Text style={styles.errorLabel}>Component Stack:</Text>
                <Text style={styles.stackText}>{errorInfo.componentStack}</Text>
              </>
            )}

            {error?.stack && (
              <>
                <Text style={styles.errorLabel}>Stack Trace:</Text>
                <Text style={styles.stackText}>{error.stack}</Text>
              </>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                Alert.alert(
                  "Full Error Details",
                  `Error: ${error?.name}\n\nMessage: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}`
                );
              }}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Show Full Error
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#d32f2f",
    fontFamily: "monospace",
  },
  stackText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
  },
  secondaryButtonText: {
    color: "#000",
  },
});

export default ErrorBoundary;
