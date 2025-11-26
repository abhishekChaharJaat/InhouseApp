import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const DocumentSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Animated.View style={[styles.icon, { opacity }]} />
          <Animated.View style={[styles.titleBar, { opacity }]} />
        </View>
        <Animated.View style={[styles.subtitleBar, { opacity }]} />
        <Animated.View style={[styles.dateBar, { opacity }]} />
      </View>
      <Animated.View style={[styles.menuIcon, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d4d3d3ff",
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  titleBar: {
    height: 16,
    width: "70%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  subtitleBar: {
    height: 14,
    width: "50%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
  },
  dateBar: {
    height: 12,
    width: "30%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  menuIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
  },
});

export default DocumentSkeleton;
