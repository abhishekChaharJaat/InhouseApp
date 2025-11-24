// app/_layout.tsx
import React, { useEffect } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { getUserMetadata } from "../store/onboardingSlice";
import ContactHelp from "./modals/ContactHelp";
import Referraldrawer from "./modals/request-review";
import SinglePlanModal from "./modals/signle-plan-modal";
import SideNav from "./navs/Sidenav";
import { setWSConnected } from "@/store/homeSlice";
import {
  connectBasicWebSocket,
  handleWebSocketMessage,
  setWebSocketInstance,
} from "./providers/wsClient";
import NotSupportedModal from "./modals/NotSupportedModal";
import { getAllThreads } from "@/store/threadSlice";

// -------------------------------------------------------
// AppContent – runs inside Clerk + Redux providers
// -------------------------------------------------------
export function AppContent() {
  const { getToken, isSignedIn } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Call on mount and when user signs in
  useEffect(() => {
    dispatch(getUserMetadata({}) as any);
    dispatch(getAllThreads() as any);
  }, [isSignedIn]);

  // Refresh metadata when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        dispatch(getUserMetadata({}) as any);
        dispatch(getAllThreads() as any);
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
        dispatch(setWSConnected(false));
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
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
        ws.close();
      }
    };
  }, [isSignedIn]);

  return (
    <>
      <Referraldrawer />
      <NotSupportedModal />
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
