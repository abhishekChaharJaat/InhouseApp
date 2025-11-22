import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { setShowSidenav } from "../../store/homeSlice";
import { UserProfile } from "./UserProfile";

export default function Topnav({ page, title }: any) {
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      {/* Menu Icon */}
      <TouchableOpacity onPress={() => dispatch(setShowSidenav(true))}>
        <MaterialIcons name="menu" size={32} color="#333" />
      </TouchableOpacity>

      {page === "home" ? (
        <Text style={styles.homeTitle}>Inhouse</Text>
      ) : page === "chat" ? (
        <Text style={styles.chatTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      ) : (
        ""
      )}

      {/* Logout Dropdown Button */}
      <UserProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: "#fff", // no red background
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    zIndex: 100,

    // Shadow for both iOS + Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 3,
  },
  homeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1, // ← gives it space
    marginHorizontal: 10,
    textAlign: "left", // ← left align always
  },
});
