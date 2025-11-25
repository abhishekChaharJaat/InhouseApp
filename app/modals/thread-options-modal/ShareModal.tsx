import { generateSharedId } from "@/store/messageSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
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
import { useDispatch } from "react-redux";

interface ShareModalProps {
  visible: boolean;
  threadId: string | null;
  onClose: () => void;
  onShare?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  threadId,
  onClose,
  onShare,
}) => {
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();

  const handleGenerateLink = () => {
    if (!threadId) {
      Alert.alert("Error", "Unable to share thread. Please try again.");
      return;
    }

    setLoading(true);
    dispatch(generateSharedId(threadId) as any).then((result: any) => {
      setLoading(false);
      if (!result.error) {
        const link = `https://dev.inhouse.ai/chat/shared/${threadId}`;
        setShareLink(link);
        if (onShare) {
          onShare();
        }
      } else {
        Alert.alert(
          "Error",
          "Failed to generate share link. Please try again."
        );
      }
    });
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await Clipboard.setStringAsync(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View
          style={styles.shareContainer}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.shareTitle}>Share Thread</Text>

          {!shareLink ? (
            <>
              <Text style={styles.shareDescription}>
                Generate a public link to share this conversation with others.
              </Text>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  loading && styles.generateButtonDisabled,
                ]}
                onPress={handleGenerateLink}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="link-outline" size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Generate Link</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.linkContainer}>
                <Text style={styles.linkText} numberOfLines={2}>
                  {shareLink}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.copyButton, copied && styles.copiedButton]}
                onPress={handleCopyLink}
              >
                <Ionicons
                  name={copied ? "checkmark-outline" : "copy-outline"}
                  size={20}
                  color={copied ? "#fff" : "#fff"}
                />
                <Text style={styles.copyButtonText}>
                  {copied ? "Copied!" : "Copy Link"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>
              {shareLink ? "Done" : "Cancel"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ShareModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "85%",
    maxWidth: "100%",
    padding: 20,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  shareDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b2b48",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: "#99c9ff",
  },
  generateButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  linkContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b2b48",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    gap: 8,
  },
  copiedButton: {
    backgroundColor: "#4CAF50",
  },
  copyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
});
