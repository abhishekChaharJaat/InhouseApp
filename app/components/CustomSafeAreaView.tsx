import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  header?: ReactNode; // optional custom header
  edges?: ("top" | "bottom" | "left" | "right")[]; // safe area edges
  style?: object;
};

export default function CustomSafeAreaView({
  children,
  header,
  edges = ["top", "bottom", "left", "right"],
  style = {},
}: Props) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {/* Optional Header */}
      {header && <View>{header}</View>}
      {/* Screen Content */}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
});
