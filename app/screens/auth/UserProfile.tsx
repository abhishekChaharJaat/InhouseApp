import { useClerk, useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const handleSignOut = async () => {
    try {
      setOpen(false);
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleCloseDropdown = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Profile icon button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
        ) : (
          <MaterialIcons name="account-circle" size={40} color="#fff" />
        )}
      </TouchableOpacity>

      {/* Full-screen modal for dropdown + outside click */}
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={handleCloseDropdown}
      >
        {/* Backdrop: screen par kahin bhi tap → close */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={handleCloseDropdown}
        >
          {/* Dropdown pe tap karne se backdrop ka onPress trigger na ho */}
          <TouchableWithoutFeedback>
            <View style={styles.dropdown}>
              <Text style={styles.name}>{fullName || "User"}</Text>
              <Text style={styles.email}>
                {user?.emailAddresses[0]?.emailAddress || ""}
              </Text>

              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setOpen(false);
                  alert("Personalize clicked!");
                }}
              >
                <MaterialIcons
                  name="settings"
                  size={20}
                  color="#000"
                  style={styles.icon}
                />
                <Text style={styles.dropdownButtonText}>Personalize</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={handleSignOut}
              >
                <MaterialIcons
                  name="logout"
                  size={20}
                  color="#000"
                  style={styles.icon}
                />
                <Text style={styles.dropdownButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "black",
    borderRadius: 50,
    padding: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },

  // pura screen cover karega
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  dropdown: {
    marginTop: 120, // header height ke hisab se adjust kar lena
    marginRight: 16,
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    padding: 12,
    borderWidth: 1,
    borderColor: "#c8c8c8",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
    paddingVertical: 10,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 4,
    borderTopWidth: 0.5,
    borderColor: "#c8c8c8",
  },
  dropdownButtonText: {
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
    color: "#000",
  },
  icon: {
    opacity: 0.75,
  },
});
