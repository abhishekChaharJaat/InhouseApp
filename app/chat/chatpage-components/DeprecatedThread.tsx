import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const DeprecatedThreadBanner = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "/mnt/data/97fcd9b4-a25b-4e4f-9c42-aa7c7220c2cf.png" }}
        style={styles.image}
        resizeMode="contain"
      />

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
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  image: {
    width: 40,
    height: 40,
  },
  text: {
    flex: 1,
    color: "#5C4B37",
    fontSize: 14,
  },
});

export default DeprecatedThreadBanner;
