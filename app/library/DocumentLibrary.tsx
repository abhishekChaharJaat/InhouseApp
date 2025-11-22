import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { token } from "@/app/data";
import { getAllGeneratedDocs } from "@/store/messageSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { formatDateTime } from "../helpers";
import Topnav from "../navs/Topnav";

const DocumentLibrary = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { documents, loadingDocuments, documentsError } = useSelector(
    (state: any) => state.message
  );
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(getAllGeneratedDocs({ token }) as any);
    }
  }, [dispatch]);

  const handleMenuOpen = (doc: any) => {
    setSelectedDoc(doc);
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
    setSelectedDoc(null);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download document:", selectedDoc);
    handleMenuClose();
  };

  const handleRename = () => {
    // TODO: Implement rename functionality
    console.log("Rename document:", selectedDoc);
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedDoc?.thread_id) {
      router.push(`/chat/${selectedDoc.thread_id}` as any);
    }
    handleMenuClose();
  };

  const renderDocument = ({ item }: any) => {
    const isLocked = item.is_document_locked;

    return (
      <View style={styles.documentCard}>
        <View style={styles.documentInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.documentName} numberOfLines={1}>
              {item.document_name || item.document_title}
            </Text>
            {isLocked && (
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color="#666" />
              </View>
            )}
          </View>
          <Text style={styles.documentTitle} numberOfLines={1}>
            {item.thread_title}
          </Text>
          <Text style={styles.documentDate}>
            {formatDateTime(item.document_creation_time)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => handleMenuOpen(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loadingDocuments) {
    return (
      <CustomSafeAreaView>
        <Topnav page="home" />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your documents...</Text>
        </View>
      </CustomSafeAreaView>
    );
  }

  if (documentsError) {
    return (
      <CustomSafeAreaView>
        <Topnav page="home" />
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>Failed to load documents</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(getAllGeneratedDocs({ token }) as any)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </CustomSafeAreaView>
    );
  }

  return (
    <CustomSafeAreaView>
      <Topnav page="home" />
      <View style={styles.container}>
        <Text style={styles.header}>Document Library</Text>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>
              Your generated documents will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            renderItem={renderDocument}
            keyExtractor={(item) => item.document_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleMenuClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleMenuClose}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleView}>
              <Ionicons name="eye-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDownload}>
              <Ionicons name="download-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleRename}>
              <Ionicons name="create-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.cancelItem]}
              onPress={handleMenuClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </CustomSafeAreaView>
  );
};

export default DocumentLibrary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: "#ffffff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d4d3d3ff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  lockedBadge: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 4,
    marginLeft: 8,
  },
  documentTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: "#999",
  },
  menuButton: {
    padding: 8,
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
