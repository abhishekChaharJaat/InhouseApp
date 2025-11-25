import { updateThreadDataTitle } from "@/store/messageSlice";
import { updateTitle } from "@/store/threadSlice";
import React, { useState, useEffect } from "react";
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

interface RenameModalProps {
  visible: boolean;
  threadId: string | null;
  currentTitle: string;
  onClose: () => void;
  onRename?: (newTitle: string) => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
  visible,
  threadId,
  currentTitle,
  onClose,
  onRename,
}) => {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const dispatch = useDispatch();

  const { updatingTitle } = useSelector((state: any) => state.thread);

  useEffect(() => {
    if (visible) {
      setNewTitle(currentTitle);
    }
  }, [visible, currentTitle]);

  const handleRenameSubmit = () => {
    if (!threadId || !newTitle.trim()) {
      Alert.alert("Error", "Please enter a valid title.");
      return;
    }

    dispatch(updateTitle({ id: threadId, title: newTitle.trim() }) as any).then(
      (result: any) => {
        if (!result.error) {
          dispatch(updateThreadDataTitle({ title: newTitle.trim() }));
          onClose();
          if (onRename) {
            onRename(newTitle.trim());
          }
        } else {
          Alert.alert("Error", "Failed to rename thread. Please try again.");
        }
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
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
              onPress={onClose}
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
  );
};

export default RenameModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
