import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useDeleteThread } from "./DeleteModal";
import RenameModal from "./RenameModal";
import ShareModal from "./ShareModal";

interface ThreadOptionsModalProps {
  threadId?: string;
  currentTitle?: string;
  onShare?: () => void;
  onRename?: (newTitle: string) => void;
  iconSize?: number;
  iconColor?: string;
}

const ThreadOptionsModal: React.FC<ThreadOptionsModalProps> = ({
  threadId = null,
  currentTitle = "",
  onShare,
  onRename,
  iconSize = 24,
  iconColor = "#333",
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const { deletingThread } = useSelector((state: any) => state.thread);

  const closeMenu = () => setMenuVisible(false);

  const { showDeleteAlert } = useDeleteThread(threadId, closeMenu);

  const handleRename = () => {
    setMenuVisible(false);
    setRenameModalVisible(true);
  };

  const handleShare = () => {
    setMenuVisible(false);
    setShareModalVisible(true);
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
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
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

            <TouchableOpacity style={styles.menuItem} onPress={showDeleteAlert}>
              <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              <Text style={[styles.menuItemText, styles.deleteText]}>
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelItem]}
              onPress={closeMenu}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Modal */}
      <RenameModal
        visible={renameModalVisible}
        threadId={threadId}
        currentTitle={currentTitle}
        onClose={() => setRenameModalVisible(false)}
        onRename={onRename}
      />

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        threadId={threadId}
        onClose={() => setShareModalVisible(false)}
        onShare={onShare}
      />
    </>
  );
};

export default ThreadOptionsModal;

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
