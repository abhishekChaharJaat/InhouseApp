// app/_layout.tsx
import { clearPendingThreadId } from "@/store/authSlice";
import { setWSConnected } from "@/store/homeSlice";
import { getAllThreads } from "@/store/threadSlice";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { getLawyerHub, getUserMetadata } from "../store/onboardingSlice";
import AuthModal from "./modals/auth/AuthModal";
import ChargebeePaymentModal from "./modals/chargebee-payment";
import PaymentStatusCheckModal from "./modals/chargebee-payment/PaymentStatusCheckModal";
import ContactHelp from "./modals/ContactHelp";
import MultiPlanModal from "./modals/multi-plan-modal";
import NotSupportedModal from "./modals/NotSupportedModal";
import Referraldrawer from "./modals/request-review";
import SinglePlanModal from "./modals/signle-plan-modal";
import SideNav from "./navs/Sidenav";
import {
  connectAuthWebSocket,
  handleWebSocketMessage,
  setWebSocketInstance,
} from "./providers/wsClient";

// -------------------------------------------------------
// AppContent – runs inside Clerk + Redux providers
// -------------------------------------------------------
export function AppContent() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const unauthThreadId = useSelector(
    (state: RootState) => state.auth.unauthThreadId
  );
  // Track previous isSignedIn to detect login transition
  const wasSignedIn = useRef(isSignedIn);

  // Call on mount and when user signs in
  useEffect(() => {
    if (isSignedIn) {
      // Check if user just logged in (transition from false to true)
      const justLoggedIn = !wasSignedIn.current && isSignedIn;
      // Pass pending thread ID to getUserMetadata for anonymous thread migration
      dispatch(getUserMetadata({ threadId: unauthThreadId }) as any);
      dispatch(getAllThreads() as any);
      dispatch(getLawyerHub());

      // If user just logged in and there's a pending thread ID, redirect to chat
      if (justLoggedIn && unauthThreadId) {
        console.log(
          "✅ User logged in with pending thread, redirecting to:",
          unauthThreadId
        );
        // Small delay to ensure auth state is fully settled
        setTimeout(() => {
          router.push(`/chat/${unauthThreadId}`);
          dispatch(clearPendingThreadId());
        }, 500);
      }
    }
    wasSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  // Refresh metadata when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Only fetch user data if signed in and app comes to foreground
      if (nextAppState === "active" && isSignedIn) {
        dispatch(getUserMetadata({}) as any);
        dispatch(getAllThreads() as any);
        dispatch(getLawyerHub());
      }
    });
    return () => {
      subscription.remove();
    };
  }, [isSignedIn]);

  // Single WebSocket effect - handles both auth and anonymous connections
  useEffect(() => {
    // Wait for Clerk to finish loading before establishing WebSocket
    if (!isLoaded) return;

    let ws: WebSocket | null = null;
    let isCleanedUp = false;

    const initWS = async () => {
      // Close existing connection before creating new one
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }

      if (isSignedIn) {
        console.log("✅ Authenticated - using token");
        ws = await connectAuthWebSocket(getToken);
      } else {
        console.log("👻 Anonymous - using anonymous_user_id");
        const { connectAnonymousWebSocket } = require("./providers/wsClient");
        ws = await connectAnonymousWebSocket();
      }

      if (!ws) {
        console.error("❌ Failed to create WebSocket");
        return;
      }

      if (!isCleanedUp) {
        setupWebSocket(ws);
      }
    };

    initWS();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && (!ws || ws.readyState !== WebSocket.OPEN)) {
        console.log(
          `App foregrounded - reconnecting ${
            isSignedIn ? "AUTH" : "ANON"
          } WebSocket`
        );
        initWS();
      }
    });

    return () => {
      isCleanedUp = true;
      sub.remove();
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [isLoaded, isSignedIn]);

  const setupWebSocket = (ws: WebSocket) => {
    if (!ws) return;
    ws.onopen = () => {
      console.log("🎉 WebSocket connected!");
      dispatch(setWSConnected(true));
      setWebSocketInstance(ws);
    };

    ws.onmessage = (event) => {
      if (event.data === "Connection successful!") {
        console.log("✅ WebSocket connection successful");
      } else {
        handleWebSocketMessage(event);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      dispatch(setWSConnected(false));
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket closed");
      dispatch(setWSConnected(false));
      setWebSocketInstance(null);
    };
  };

  return (
    <>
      <Referraldrawer />
      <NotSupportedModal />
      {!isSignedIn && <AuthModal />}
      <ContactHelp />
      <SideNav />
      <SinglePlanModal />
      <MultiPlanModal />
      <ChargebeePaymentModal />
      <PaymentStatusCheckModal />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
