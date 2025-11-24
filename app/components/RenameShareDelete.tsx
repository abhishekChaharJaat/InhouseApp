import { resetThreadData } from "@/store/messageSlice";
import { deleteThread } from "@/store/threadSlice";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface RenameShareDeleteProps {
  threadId?: string;
  onShare?: () => void;
  onRename?: () => void;
  iconSize?: number;
  iconColor?: string;
}

const RenameShareDelete: React.FC<RenameShareDeleteProps> = ({
  threadId,
  onShare,
  onRename,
  iconSize = 24,
  iconColor = "#333",
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { deletingThread } = useSelector((state: any) => state.thread);

  const handleShare = () => {
    setMenuVisible(false);
    if (onShare) {
      onShare();
    } else {
      // TODO: Implement default share functionality
      console.log("Share thread:", threadId);
    }
  };

  const handleRename = () => {
    setMenuVisible(false);
    if (onRename) {
      onRename();
    } else {
      // TODO: Implement default rename functionality
      console.log("Rename thread:", threadId);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);

    if (!threadId) {
      Alert.alert("Error", "Unable to delete thread. Please try again.");
      return;
    }

    Alert.alert(
      "Delete Thread",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(deleteThread({ id: threadId }) as any).then(
              (result: any) => {
                if (!result.error) {
                  // Reset thread data after successful deletion
                  dispatch(resetThreadData());
                  if (pathname !== "/history/ChatHistory") {
                    router.replace("/home/Home");
                  }
                }
              }
            );
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
        disabled={deletingThread}
      >
        {deletingThread ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Ionicons
            name="ellipsis-vertical"
            size={iconSize}
            color={iconColor}
          />
        )}
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleRename}>
              <Ionicons name="create-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              <Text style={[styles.menuItemText, styles.deleteText]}>
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelItem]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default RenameShareDelete;

const styles = StyleSheet.create({
  menuButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "80%",
    maxWidth: 300,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
  },
  deleteText: {
    color: "#d32f2f",
  },
  cancelItem: {
    borderBottomWidth: 0,
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
});
