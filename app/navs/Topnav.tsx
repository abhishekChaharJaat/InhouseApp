import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setShowSidenav } from "../../store/homeSlice";
import RenameShareDelete from "../components/RenameShareDelete";
import { UserProfile } from "./UserProfile";

export default function Topnav({ page, title, threadId }: any) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isWSConnected = useSelector((state: any) => state.home.isWSConnected);
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

      {/* 3-dot menu for chat page */}
      {page === "chat" && (
        <View style={styles.menuWrapper}>
          <RenameShareDelete
            threadId={threadId}
            iconSize={24}
            iconColor="#333"
          />
        </View>
      )}

      {/* Logout Dropdown Button */}
      <UserProfile />
      {isWSConnected && <View style={styles.dot}></View>}
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
  menuWrapper: {
    marginRight: 8,
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 40,
    width: 14,
    height: 14,
    borderRadius: 50,
    backgroundColor: "#8cf148ff",
  },
});
