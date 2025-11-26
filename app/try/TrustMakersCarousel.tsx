import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const Trustmakers = () => {
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Full width slide
  const slideWidth = screenWidth;

  const items = [
    {
      icon: "business-outline",
      title: "2M+",
      description: "business owners and consumers helped",
    },
    {
      icon: "cash-outline",
      title: "$1.2 billion",
      description: "in legal fees saved",
    },
    {
      icon: "people-outline",
      title: "2,000+",
      description: "Lawyers on demand",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeIndex + 1) % items.length;
      scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
      setActiveIndex(next);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex, slideWidth]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    setActiveIndex(newIndex);
  };

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <ScrollView
          ref={scrollRef}
          horizontal
          snapToInterval={slideWidth}
          snapToAlignment="center"
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        >
          {items.map((item, index) => (
            <View key={index} style={[styles.slide, { width: slideWidth }]}>
              <View style={styles.column}>
                <Ionicons name={item.icon as any} size={28} color="#1B2B48" />
                <Text style={styles.textLine}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.desc}> {item.description}</Text>
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { width: "100%", marginHorizontal: 0, paddingHorizontal: 0 },
  card: {
    marginTop: 16,
    marginHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: "#f1f7f1",
    overflow: "hidden",
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
  },
  column: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingRight: 30,
  },
  textLine: {
    textAlign: "center",
    flexWrap: "wrap",
    flexShrink: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B2B48",
  },
  desc: {
    fontSize: 15,
    color: "#1B2B48",
  },
  dots: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#c8d0e0",
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1B2B48",
  },
});

export default Trustmakers;
