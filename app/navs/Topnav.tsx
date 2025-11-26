import {
  clearPendingThreadId,
  setShowAuthModal,
  setUnauthThreadId,
} from "@/store/authSlice";
import { resetThreadData } from "@/store/messageSlice";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setShowSidenav } from "../../store/homeSlice";
import ThreadOptionsModal from "../modals/thread-options-modal";
import { UserProfile } from "../profile/UserProfile";
export default function Topnav({ page, title, threadId }: any) {
  const dispatch = useDispatch();
  const { isSignedIn } = useAuth();
  const isWSConnected = useSelector((state: any) => state.home.isWSConnected);
  return (
    <>
      {isSignedIn ? (
        <View style={styles.container}>
          {/* Menu Icon */}
          <TouchableOpacity onPress={() => dispatch(setShowSidenav(true))}>
            <MaterialIcons name="menu" size={32} color="#333" />
          </TouchableOpacity>

          {page === "home" ? (
            <Image
              source={require("@/assets/app-images/inhouse-text-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : page === "chat" ? (
            <Text
              style={styles.chatTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title || "New Thread"}
            </Text>
          ) : (
            ""
          )}
          {/* 3-dot menu for chat page */}
          {page === "chat" && (
            <View style={styles.menuWrapper}>
              <ThreadOptionsModal
                threadId={threadId}
                currentTitle={title}
                iconSize={24}
                iconColor="#333"
              />
            </View>
          )}
          {/* Logout Dropdown Button */}
          <UserProfile />
          {isWSConnected && <View style={styles.dot}></View>}
        </View>
      ) : (
        // ==================== Non auth Top nav ============================
        <View style={styles.container}>
          {page === "try" ? (
            <>
              <Image
                source={require("@/assets/app-images/inhouse-text-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <View style={styles.buttonContainer}>
                {/* Log In - White */}
                <TouchableOpacity
                  style={[styles.button, styles.whiteButton]}
                  onPress={() => {
                    dispatch(setShowAuthModal({ show: true, type: "signin" }));
                  }}
                >
                  <Text style={[styles.buttonText, styles.whiteButtonText]}>
                    Log In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.darkButton]}
                  onPress={() => {
                    dispatch(setShowAuthModal({ show: true, type: "signup" }));
                  }}
                >
                  <Text style={[styles.buttonText, styles.darkButtonText]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  navigate("/try/LandingPage");
                  dispatch(clearPendingThreadId());
                  dispatch(resetThreadData());
                }}
              >
                <MaterialIcons
                  style={styles.plusButton}
                  name="add"
                  size={32}
                  color="#333"
                />
              </TouchableOpacity>
              <Text
                style={styles.chatTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title || "New Thread"}
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.darkButton]}
                onPress={() => {
                  dispatch(setShowAuthModal({ show: true, type: "signup" }));
                  dispatch(setUnauthThreadId(threadId));
                }}
              >
                <Text style={[styles.buttonText, styles.darkButtonText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </>
          )}
          {isWSConnected && <View style={styles.dot}></View>}
        </View>
      )}
    </>
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

    // Shadow only at bottom for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, // horizontal offset 0, vertical offset 2
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 0,
  },

  logoImage: {
    width: 110,
    height: 32,
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
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 50,
    backgroundColor: "#8cf148ff",
  },

  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50, // pill shape
    marginLeft: 10,
    borderWidth: 1,
  },
  darkButton: {
    backgroundColor: "#1b2b48",
    borderColor: "#1b2b48",
  },
  whiteButton: {
    backgroundColor: "#fff",
    borderColor: "#1b2b48",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  darkButtonText: {
    color: "#fff",
  },
  whiteButtonText: {
    color: "#1b2b48",
  },
  plusButton: {
    borderWidth: 1,
    padding: 1,
    borderRadius: 50,
    borderColor: "#eeebebff",
    backgroundColor: "#e9e8e8ff",
  },
});
