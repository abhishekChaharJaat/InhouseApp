import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { StyleSheet, View } from "react-native";
import Signin from "./screens/auth/Signin";
import Home from "./screens/home/Home";
export default function Index() {
  return (
    <View style={styles.container}>
      <SignedIn>
        <Home />
      </SignedIn>
      <SignedOut>
        <Signin />
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
