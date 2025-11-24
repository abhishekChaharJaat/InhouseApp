// app/_layout.tsx
import React from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Provider } from "react-redux";
import { store } from "../store";
import { AppContent } from "./App";

// RootLayout – used by Expo Router at app/_layout.tsx
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
