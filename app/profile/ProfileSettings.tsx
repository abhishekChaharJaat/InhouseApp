import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileSettings() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setIsUpdating(true);
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.errors?.[0]?.message || "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!user) return;

    try {
      setIsUploadingImage(true);

      // Fetch the image and convert to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });

      await user.setProfileImage({ file });
      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.errors?.[0]?.message || "Failed to update profile picture"
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !user.imageUrl) return;

    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUploadingImage(true);
              await user.setProfileImage({ file: null });
              Alert.alert("Success", "Profile picture removed");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.errors?.[0]?.message || "Failed to remove profile picture"
              );
            } finally {
              setIsUploadingImage(false);
            }
          },
        },
      ]
    );
  };

  if (!isLoaded) {
    return (
      <CustomSafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F3C5A" />
        </View>
      </CustomSafeAreaView>
    );
  }

  return (
    <CustomSafeAreaView>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1b2b48" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {isUploadingImage ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="large" color="#2F3C5A" />
              </View>
            ) : user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {firstName.charAt(0).toUpperCase()}
                  {lastName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handlePickImage}
              disabled={isUploadingImage}
            >
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handlePickImage}
            disabled={isUploadingImage}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>

          {user?.imageUrl && (
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={handleRemoveImage}
              disabled={isUploadingImage}
            >
              <Text style={styles.removePhotoText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                {user?.primaryEmailAddress?.emailAddress || "No email"}
              </Text>
              <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
            </View>
            <Text style={styles.fieldHint}>
              Email cannot be changed from this app
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
            onPress={handleUpdateProfile}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Device Sessions Link */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/profile/DeviceSessions")}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="phone-portrait-outline" size={22} color="#1b2b48" />
            <Text style={styles.menuItemText}>Device Sessions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </CustomSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1b2b48",
  },
  headerRight: {
    width: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2F3C5A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2F3C5A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F6FEB",
  },
  removePhotoButton: {
    paddingVertical: 4,
  },
  removePhotoText: {
    fontSize: 13,
    color: "#EF4444",
  },
  formSection: {
    padding: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1b2b48",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    fontSize: 15,
    color: "#1b2b48",
  },
  disabledInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
  },
  disabledInputText: {
    fontSize: 15,
    color: "#6B7280",
  },
  fieldHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: "#2F3C5A",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1b2b48",
  },
});
