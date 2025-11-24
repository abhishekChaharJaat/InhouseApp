// app/_layout.tsx
import React, { useEffect } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Provider, useDispatch } from "react-redux";
import { Alert } from "react-native";
import { store, AppDispatch } from "../store";
import { getUserMetadata } from "../store/onboardingSlice";

import ContactHelp from "./modals/ContactHelp";
import Referraldrawer from "./modals/request-review";
import SinglePlanModal from "./modals/signle-plan-modal";
import SideNav from "./navs/Sidenav";
// import {
//   connectBasicWebSocket,
//   handleReceivedMessages,
//   handleSocketMessage,
// } from "./providers/wsClient";

import { setWSConnected } from "@/store/homeSlice";
import {
  connectBasicWebSocket,
  handleWebSocketMessage,
  setWebSocketInstance,
} from "./providers/wsClient";
import { setToken } from "@/store/authSlice";
// -------------------------------------------------------
// AppContent – runs inside Clerk + Redux providers
// -------------------------------------------------------
function AppContent() {
  const { getToken, isSignedIn } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Fetch user metadata using your existing static token
  const fetchUserMetadata = async () => {
    if (!isSignedIn) return;
    const token = await getToken();
    try {
      if (token) {
        dispatch(setToken(token));
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

  // Refresh metadata when app comes to foreground
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

  // Inside AppContent

  useEffect(() => {
    if (!isSignedIn) return;
    let ws: any = null;
    const initWS = async () => {
      // connect to ws
      ws = await connectBasicWebSocket(getToken);

      if (!ws) {
        console.error("Failed to create WebSocket");
        return;
      }
      // Store the WebSocket instance immediately
      setWebSocketInstance(ws);

      ws.onopen = () => {
        console.log("WebSocket connected");
        dispatch(setWSConnected(true));
        setWebSocketInstance(ws); // Store again on open
        Alert.alert("WebSocket", "Connection successful!");
      };

      ws.onmessage = (event: any) => {
        if (event.data === "Connection successful!") {
          console.log("WebSocket connection successful");
        } else {
          handleWebSocketMessage(event);
        }
      };

      ws.onerror = (error: any) => {
        console.error("WebSocket error:", error);
        Alert.alert("WebSocket Error", "Connection failed.");
        dispatch(setWSConnected(false));
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        dispatch(setWSConnected(false));
        setWebSocketInstance(null); // Clear instance on close
      };
    };
    initWS();

    // Cleanup
    return () => {
      dispatch(setWSConnected(false));
      setWebSocketInstance(null);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isSignedIn]);

  return (
    <>
      <Referraldrawer />
      <ContactHelp />
      <SideNav />
      <SinglePlanModal />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

// -------------------------------------------------------
// RootLayout – used by Expo Router at app/_layout.tsx
// -------------------------------------------------------
export default function RootLayout() {
  return (
    <Provider store={store}>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <AppContent />
      </ClerkProvider>
    </Provider>
  );
}
