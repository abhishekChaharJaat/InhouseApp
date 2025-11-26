import CustomSafeAreaView from "@/app/components/CustomSafeAreaView";
import { setToken } from "@/store/authSlice";
import { setViewDocInModal } from "@/store/homeSlice";
import { getAllGeneratedDocs } from "@/store/messageSlice";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Topnav from "../navs/Topnav";
import {
  formatDateTime,
  handleLegalReviewButtonClicked,
} from "../utils/helpers";
import DocumentSkeleton from "./DocumentSkeleton";

const DocumentLibrary = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { getToken } = useAuth();
  const { documents, loadingDocuments, documentsError } = useSelector(
    (state: any) => state.message
  );
  const userMetadata = useSelector(
    (state: any) => state.onboarding.userMetadata
  );
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // fetch all docs
  useEffect(() => {
    dispatch(getAllGeneratedDocs() as any);
  }, [dispatch]);

  // Sort documents by creation date (most recent first)
  const sortedDocuments = useMemo(() => {
    if (!documents || documents.length === 0) return [];
    return [...documents].sort((a, b) => {
      const dateA = new Date(a.document_creation_time).getTime();
      const dateB = new Date(b.document_creation_time).getTime();
      return dateB - dateA; // Most recent first
    });
  }, [documents]);

  const handleMenuOpen = (doc: any) => {
    setSelectedDoc(doc);
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
    setSelectedDoc(null);
  };

  const handleViewDoc = () => {
    if (selectedDoc?.document_id) {
      dispatch(
        setViewDocInModal({
          show: true,
          googleDocId: selectedDoc?.document_id,
          threadId: selectedDoc?.thread_id,
        })
      );
      handleMenuClose();
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    console.log("Download as PDF:", selectedDoc);
    handleMenuClose();
  };

  const handleDownloadDoc = () => {
    // TODO: Implement DOC download functionality
    console.log("Download as DOC:", selectedDoc);
    handleMenuClose();
  };

  const handleRequestFinalize = () => {
    //  request finalize functionality
    const btn = {
      text: "Request Finaliztion",
      eligible_offers: selectedDoc?.eligible_offers,
    };
    handleLegalReviewButtonClicked(
      btn,
      dispatch,
      userMetadata,
      selectedDoc?.thread_id,
      selectedDoc?.is_document_locked
    );
    handleMenuClose();
  };

  const renderDocument = ({ item }: any) => {
    const isLocked = item.is_document_locked;

    return (
      <View style={styles.documentCard}>
        <View style={styles.documentInfo}>
          <View style={styles.titleRow}>
            <Ionicons
              name={isLocked ? "lock-closed" : "document-text-outline"}
              size={16}
              color={isLocked ? "#666" : "#000"}
              style={styles.titleIcon}
            />
            <Text style={styles.documentName} numberOfLines={1}>
              {item.document_name || item.document_title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (item.thread_id) {
                router.push(`/chat/${item.thread_id}` as any);
              }
            }}
          >
            <Text style={styles.documentTitle} numberOfLines={1}>
              {item.thread_title}
            </Text>
          </TouchableOpacity>
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
        <View style={styles.container}>
          <Text style={styles.header}>Document Library</Text>
          <DocumentSkeleton />
          <DocumentSkeleton />
          <DocumentSkeleton />
        </View>
      </CustomSafeAreaView>
    );
  }

  const handleRetry = async () => {
    // Get fresh token before retrying
    const freshToken = await getToken();
    if (freshToken) {
      dispatch(setToken(freshToken));
      dispatch(getAllGeneratedDocs() as any);
    }
  };

  if (documentsError) {
    return (
      <CustomSafeAreaView>
        <Topnav page="home" />
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>Failed to load documents</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
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

        {sortedDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>
              Your generated documents will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedDocuments}
            renderItem={renderDocument}
            keyExtractor={(item, index) =>
              item.document_id ? `${item.document_id}-${index}` : `doc-${index}`
            }
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
            {/* Document Name Header */}
            <View style={styles.menuHeader}>
              <Ionicons
                name={
                  selectedDoc?.is_document_locked
                    ? "lock-closed"
                    : "document-text-outline"
                }
                size={24}
                color="#777676ff"
              />
              <Text style={styles.menuHeaderText} numberOfLines={2}>
                {selectedDoc?.document_name ||
                  selectedDoc?.document_title ||
                  "Untitled Document"}
              </Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={handleViewDoc}>
              <Ionicons name="eye-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>View Document</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDownloadPDF}
            >
              <Ionicons name="document-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>Download as PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDownloadDoc}
            >
              <Ionicons name="document-text-outline" size={20} color="#000" />
              <Text style={styles.menuItemText}>Download as Doc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleRequestFinalize}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#000"
              />
              <Text style={styles.menuItemText}>Request Finalization</Text>
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
    shadowRadius: 2,
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
  titleIcon: {
    marginRight: 8,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    color: "#0257b1ff",
    marginBottom: 4,
    textDecorationLine: "underline",
  },
  documentDate: {
    fontSize: 12,
    color: "#999",
  },
  menuButton: {
    padding: 8,
    borderRadius: 50,
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
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f8f8f8",
  },
  menuHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 6,
    flex: 1,
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
    color: "#d32f2f",
    textAlign: "center",
  },
});
