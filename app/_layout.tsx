import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import SideNav from "./screens/navs/Sidenav";
import ContactHelp from "./screens/popups/ContactHelp";
import { store } from "./store";

export default function RootLayout() {
  const CLERK_PUBLISHABLE_KEY =
    "pk_test_ZW5nYWdpbmctc3BhbmllbC03Ny5jbGVyay5hY2NvdW50cy5kZXYk";
  return (
    <Provider store={store}>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <ContactHelp />
        <SideNav />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ClerkProvider>
    </Provider>
  );
}
