import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { Provider, useDispatch } from "react-redux";
import { AppDispatch, store } from "../store";
import { getUserMetadata } from "../store/onboardingSlice";
import { token } from "./data";
import ContactHelp from "./modals/ContactHelp";
import Referraldrawer from "./modals/request-review";
import SinglePlanModal from "./modals/signle-plan-modal";
import SideNav from "./navs/Sidenav";
import { WebSocketProvider } from "./providers/WebSocketProvider";
function AppContent() {
  const { getToken, isSignedIn } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Fetch user metadata
  const fetchUserMetadata = async () => {
    if (!isSignedIn) return;
    try {
      if (token) {
        dispatch(getUserMetadata({ token }));
      }
    } catch (error) {
      console.error("Error fetching user metadata:", error);
    }
  };

  // Call on mount and when user signs in
  useEffect(() => {
    fetchUserMetadata();
  }, [isSignedIn]);

  // Call when app comes to foreground (refresh)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        fetchUserMetadata();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isSignedIn]);

  return (
    <WebSocketProvider>
      <Referraldrawer />
      <ContactHelp />
      <SideNav />
      <SinglePlanModal />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </WebSocketProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <AppContent />
      </ClerkProvider>
    </Provider>
  );
}
