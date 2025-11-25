import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { StyleSheet, View } from "react-native";
import Home from "./home/Home";
import LandingPage from "./try/LandingPage";

export default function Index() {
  return (
    <View style={styles.container}>
      <SignedIn>
        <Home />
      </SignedIn>
      <SignedOut>
        {/* <Signin /> */}
        <LandingPage />
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
