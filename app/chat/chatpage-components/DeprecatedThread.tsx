import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DeprecatedThreadBanner = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This chat is now read-only following an AI upgrade to improve your
        experience. To continue, start a new conversation or contact
        support@inhouse.ai for help with this thread.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF7E6",
    borderColor: "#D6A96E",
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
  },
  text: {
    flex: 1,
    color: "#5C4B37",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DeprecatedThreadBanner;
