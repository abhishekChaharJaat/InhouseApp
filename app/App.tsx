// app/_layout.tsx
import { setWSConnected } from "@/store/homeSlice";
import { getAllThreads } from "@/store/threadSlice";
import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { AppState } from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { getUserMetadata } from "../store/onboardingSlice";
import AuthModal from "./modals/auth/AuthModal";
import ContactHelp from "./modals/ContactHelp";
import MultiPlanModal from "./modals/multi-plan-modal";
import NotSupportedModal from "./modals/NotSupportedModal";
import Referraldrawer from "./modals/request-review";
import SinglePlanModal from "./modals/signle-plan-modal";
import SideNav from "./navs/Sidenav";
import {
  connectBasicWebSocket,
  handleWebSocketMessage,
  setWebSocketInstance,
} from "./providers/wsClient";

// -------------------------------------------------------
// AppContent – runs inside Clerk + Redux providers
// -------------------------------------------------------
export function AppContent() {
  const { getToken, isSignedIn } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Call on mount and when user signs in
  useEffect(() => {
    // Only fetch user data if signed in
    if (isSignedIn) {
      dispatch(getUserMetadata({}) as any);
      dispatch(getAllThreads() as any);
    }
  }, [isSignedIn]);

  // Refresh metadata when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Only fetch user data if signed in and app comes to foreground
      if (nextAppState === "active" && isSignedIn) {
        dispatch(getUserMetadata({}) as any);
        dispatch(getAllThreads() as any);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [isSignedIn]);

  // Inside AppContent - WebSocket setup for BOTH authenticated and anonymous users
  useEffect(() => {
    let ws: any = null;

    const initWS = async () => {
      // Choose connection type based on authentication
      if (isSignedIn) {
        console.log("✅ Authenticated - using token");
        ws = await connectBasicWebSocket(getToken);
      } else {
        console.log("👻 Anonymous - using anonymous_user_id");
        const { connectAnonymousWebSocket } = require("./providers/wsClient");
        ws = await connectAnonymousWebSocket();
      }
      if (!ws) {
        console.error("❌ Failed to create WebSocket");
        return;
      }
      console.log("✅ WebSocket instance created");
      setWebSocketInstance(ws);
      ws.onopen = () => {
        console.log("🎉 WebSocket connected!");
        dispatch(setWSConnected(true));
        setWebSocketInstance(ws); // Store again on open
      };

      ws.onmessage = (event: any) => {
        if (event.data === "Connection successful!") {
          console.log("✅ WebSocket connection successful");
        } else {
          handleWebSocketMessage(event);
        }
      };

      ws.onerror = (error: any) => {
        console.error("❌ WebSocket error:", error);
        dispatch(setWSConnected(false));
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket closed");
        dispatch(setWSConnected(false));
        setWebSocketInstance(null); // Clear instance on close
      };
    };
    initWS();

    // Handle app state changes for WebSocket reconnection
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          // Check if WebSocket is disconnected when app comes to foreground
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.log("App foregrounded - reconnecting WebSocket");
            initWS();
          }
        }
      }
    );

    // Cleanup
    return () => {
      appStateSubscription.remove();
      dispatch(setWSConnected(false));
      setWebSocketInstance(null);
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("🛑 Cleaning up WebSocket");
        ws.close();
      }
    };
  }, [isSignedIn]); // Re-run when auth status changes

  return (
    <>
      <Referraldrawer />
      <NotSupportedModal />
      {!isSignedIn && <AuthModal />}
      <ContactHelp />
      <SideNav />
      <SinglePlanModal />
      <MultiPlanModal />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
