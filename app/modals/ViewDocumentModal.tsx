import { handleLegalReviewButtonClicked } from "@/app/utils/helpers";
import { setViewDocInModal } from "@/store/homeSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ViewDocumentModal = () => {
  const dispatch = useDispatch();
  const userMetadata = useSelector(
    (state: any) => state.onboarding.userMetadata
  );
  const threadData = useSelector((state: any) => state.message.threadData);
  const { threadId, googleDocId, show } = useSelector(
    (state: any) => state.home.viewDocInModal
  );

  const onClose = () => {
    dispatch(setViewDocInModal({ show: false, googleDocId: "", threadId: "" }));
  };

  if (!googleDocId) return null;

  const previewUrl = `https://docs.google.com/document/d/${googleDocId}/preview?rm=minimal`;
  const pdfUrl = `https://docs.google.com/document/d/${googleDocId}/export?format=pdf`;

  const handleDownloadPdf = () => Linking.openURL(pdfUrl);

  const handleRequestFinalization = () => {
    const btn = {
      text: "Finalize with Attorney",
      eligible_offers: {
        ai_document: null,
        lawyer_finalization: "default",
        lawyer_consultation: null,
      },
    };
    handleLegalReviewButtonClicked(
      btn,
      dispatch,
      userMetadata,
      threadData?.id,
      false
    );
    onClose();
  };

  return (
    <Modal
      visible={show}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.docContainer}>
            {/* PREVIEW - Scrollable */}
            <View style={styles.previewContainer}>
              <WebView
                source={{ uri: previewUrl }}
                style={styles.webview}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                scrollEnabled={true}
                nestedScrollEnabled={true}
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
                originWhitelist={["https://*"]}
              />
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                {/* <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={18}
                  color="#1b2b48"
                  style={{ marginRight: 10 }}
                /> */}
                <Text style={styles.footerText}>
                  Have your document finalized by an expert lawyer to ensure
                  it's airtight.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.footerButton}
                onPress={handleRequestFinalization}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={16}
                  color="#1b2b48"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.footerButtonText}>Finalization</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ViewDocumentModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalContent: {
    backgroundColor: "#f8f8f8ff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.8,
    paddingTop: 16,
  },

  closeButton: {
    position: "absolute",
    top: 18,
    right: 16,
    zIndex: 10,
    padding: 10,
    backgroundColor: "#f8f8f8ff",
  },

  docContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  /** PREVIEW - Full height scrollable **/
  previewContainer: {
    flex: 1,
    backgroundColor: "white",
  },

  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },

  /** FOOTER **/
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fef9ffff",
    borderTopWidth: 1,
    borderTopColor: "#E6D9FF",
    gap: 4,
    paddingBottom: 24,
  },

  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  footerText: {
    flex: 1,
    fontSize: 14,
    color: "#1b2b48",
    fontWeight: "500",
  },

  footerButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1b2b48",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "white",
  },

  footerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1b2b48",
  },
});
