import { resetThreadData, updateThreadDataTitle } from "@/store/messageSlice";
import { deleteThread, updateTitle } from "@/store/threadSlice";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface RenameShareDeleteProps {
  threadId?: string;
  currentTitle?: string;
  onShare?: () => void;
  onRename?: (newTitle: string) => void;
  iconSize?: number;
  iconColor?: string;
}

const RenameShareDelete: React.FC<RenameShareDeleteProps> = ({
  threadId = null,
  currentTitle = "",
  onShare,
  onRename,
  iconSize = 24,
  iconColor = "#333",
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { deletingThread, updatingTitle } = useSelector(
    (state: any) => state.thread
  );

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
    setNewTitle(currentTitle);
    setRenameModalVisible(true);
  };

  const handleRenameSubmit = () => {
    if (!threadId || !newTitle.trim()) {
      Alert.alert("Error", "Please enter a valid title.");
      return;
    }

    dispatch(updateTitle({ id: threadId, title: newTitle.trim() }) as any).then(
      (result: any) => {
        if (!result.error) {
          // Update the title in threadData for instant UI update
          dispatch(updateThreadDataTitle({ title: newTitle.trim() }));
          setRenameModalVisible(false);
          if (onRename) {
            onRename(newTitle.trim());
          }
        } else {
          Alert.alert("Error", "Failed to rename thread. Please try again.");
        }
      }
    );
  };

  const deleteConfirm = () => {
    dispatch(deleteThread(threadId) as any).then((result: any) => {
      if (!result.error) {
        dispatch(resetThreadData());
        if (pathname !== "/history/ChatHistory") {
          router.replace("/home/Home");
        }
      }
    });
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
            deleteConfirm();
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

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRenameModalVisible(false)}
        >
          <View
            style={styles.renameContainer}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.renameTitle}>Rename Thread</Text>
            <TextInput
              style={styles.renameInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Enter new title"
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.renameButtons}>
              <TouchableOpacity
                style={styles.renameCancelButton}
                onPress={() => setRenameModalVisible(false)}
                disabled={updatingTitle}
              >
                <Text style={styles.renameCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.renameSubmitButton,
                  updatingTitle && styles.renameSubmitButtonDisabled,
                ]}
                onPress={handleRenameSubmit}
                disabled={updatingTitle}
              >
                {updatingTitle ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.renameSubmitText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
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
  renameContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "85%",
    maxWidth: "100%",
    padding: 20,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  renameInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  renameButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  renameCancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  renameCancelText: {
    fontSize: 16,
    color: "#666",
  },
  renameSubmitButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    backgroundColor: "#1b2b48",
    minWidth: 80,
    alignItems: "center",
  },
  renameSubmitButtonDisabled: {
    backgroundColor: "#99c9ff",
  },
  renameSubmitText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
