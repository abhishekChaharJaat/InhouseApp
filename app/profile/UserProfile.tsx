import { clearUserMetadata } from "@/store/onboardingSlice";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

export const UserProfile = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    dispatch(clearUserMetadata());
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoggingOut(false);
      setOpen(false);
    }
  };

  const handleCloseDropdown = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Profile icon button */}
      <TouchableOpacity
        style={styles.avatarButton}
        onPress={() => setOpen(true)}
        activeOpacity={0.9}
      >
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={handleCloseDropdown}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={handleCloseDropdown}
        >
          <TouchableWithoutFeedback>
            <View style={styles.dropdown}>
              <View style={styles.userInfo}>
                <View>
                  <Text style={styles.name}>{fullName || "User"}</Text>
                  <Text style={styles.email}>
                    {user?.emailAddresses[0]?.emailAddress || ""}
                  </Text>
                </View>
              </View>

              {/* Profile Option */}
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setOpen(false);
                  router.push("/profile/ProfileSettings");
                }}
              >
                <Ionicons name="person-outline" size={20} color="#444" />
                <Text style={styles.dropdownButtonText}>Profile</Text>
              </TouchableOpacity>

              {/* Security Option */}
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setOpen(false);
                  router.push("/profile/DeviceSessions");
                }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#444"
                />
                <Text style={styles.dropdownButtonText}>Security</Text>
              </TouchableOpacity>

              {/* Logout Option */}
              <TouchableOpacity
                style={[styles.dropdownButton, styles.logoutButton]}
                onPress={handleSignOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                )}
                <Text style={[styles.dropdownButtonText, styles.logoutText]}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  avatarButton: {
    borderRadius: 50,
    overflow: "hidden",
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },

  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  dropdown: {
    marginTop: Platform.OS === "ios" ? 120 : 60,
    marginRight: 16,
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
  },

  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#3A3A3A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarSmallImg: {
    width: 36,
    height: 36,
    borderRadius: 50,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  email: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },

  dropdownButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },

  logoutButton: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },

  logoutText: {
    color: "#EF4444",
  },
});

const x = {
  today: [],
  yesterday: [],
  previous_7_days: [],
  previous_30_days: [
    {
      id: "0f90ce01-182b-48d9-97b3-85e1e0399bcd",
      created_at: "2025-10-29T10:57:07.142000",
      type: "ask",
      title: "Contract Drafting Request",
      messaging_disabled: false,
      is_shared: true,
      google_doc_id: null,
    },
    {
      id: "da2f4991-b3e2-496c-bb08-994de73cd4cf",
      created_at: "2025-10-29T11:08:19.124000",
      type: "ask",
      title: "IP Protection Advice",
      messaging_disabled: false,
      is_shared: true,
      google_doc_id: null,
    },
    {
      id: "dd7f8bfb-2f78-4f13-b8f8-8efb417f1bbb",
      created_at: "2025-10-29T11:03:05.428000",
      type: "ask",
      title: "Company Formation Advice",
      messaging_disabled: false,
      is_shared: true,
      google_doc_id: null,
    },
  ],
  older: [
    {
      id: "6e03ec8f-7572-498b-abf7-60f55bc2afbb",
      created_at: "2025-09-24T06:56:37.396000",
      type: "draft",
      title: "Drafting Customer Contract",
      messaging_disabled: false,
      is_shared: false,
      google_doc_id: "1FW4xNKRYrvGzeKKm5jeif7N60po6pKAUms8Vv_bUSp0",
    },
  ],
};
