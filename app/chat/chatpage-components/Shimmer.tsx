// ShimmerTextRotator.js
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const MESSAGES = [
  "Reviewing your request",
  "Researching",
  "Searching relevant lawyer notes",
  "Identifying legal risks",
  "Identifying legal opportunities",
];

const Shimmer = () => {
  const [index, setIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Rotate text every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate dots: "", ".", "..", "..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {MESSAGES[index]}
        {dots}
      </Text>
    </View>
  );
};

export default Shimmer;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2933",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
