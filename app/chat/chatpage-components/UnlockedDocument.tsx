// UnlockedDocument.tsx
import { handleLegalReviewButtonClicked } from "@/app/utils/helpers";
import { setViewDocInModal } from "@/store/homeSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";

export default function UnlockedDocument({ message }: any) {
  const dispatch = useDispatch();
  const [finalized, setFinalized] = useState(false);
  const googleDocId = message?.payload?.google_doc_id;
  const docTitle = message?.payload?.doc_title || "Untitled Document";
  const userMetadata = useSelector(
    (state: any) => state.onboarding.userMetadata
  );
  const lawyerHubData = useSelector(
    (state: any) => state.onboarding.lawyerHubData
  );
  if (!googleDocId) return null;
  const threadData = useSelector((state: any) => state.message.threadData);
  if (!googleDocId) return null;
  const previewUrl = `https://docs.google.com/document/d/${googleDocId}/preview?rm=minimal`;
  const pdfUrl = `https://docs.google.com/document/d/${googleDocId}/export?format=pdf`;

  const handleViewDoc = () => {
    dispatch(
      setViewDocInModal({
        show: true,
        googleDocId: googleDocId,
        threadId: threadData?.id,
      })
    );
  };
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
  };

  useEffect(() => {
    const thread = lawyerHubData?.find(
      (lead: any) => lead.thread_id === threadData?.id
    );
    console.log("thread ", thread);
    if (!thread?.finalization_requested) return;

    if (thread?.finalization_requested) {
      setFinalized(true);
    }
  }, [lawyerHubData]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.docContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={30}
            color="#1b2b48"
            style={{ marginRight: 8 }}
          />

          <Text style={styles.headerTitle} numberOfLines={1}>
            {docTitle}
          </Text>

          <TouchableOpacity
            style={styles.downloadPill}
            onPress={handleDownloadPdf}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="download"
              size={18}
              color="#1b2b48"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>

        {/* PREVIEW */}
        <View style={styles.previewContainer}>
          <View pointerEvents="none" style={styles.webviewWrapper}>
            <WebView
              source={{ uri: previewUrl }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </View>

          {/* VIEW DOC BUTTON */}
          <TouchableOpacity
            style={styles.accessButton}
            activeOpacity={0.85}
            onPress={handleViewDoc}
          >
            <MaterialCommunityIcons
              name="open-in-new"
              size={18}
              color="white"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.accessButtonText}>View Document</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        {finalized ? (
          <View style={styles.requestedFooter}>
            <View style={styles.footerLeft}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={20}
                color="#24990cff"
                style={{ marginRight: 10 }}
              />

              <Text style={styles.footerText}>
                Review requested successfully! Further details have been sent to
                your email.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>
                Have your document finalized by an expert lawyer to ensure it’s
                airtight.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.footerButton}
              onPress={handleRequestFinalization}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={18}
                color="#1b2b48"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.footerButtonText}>Finalization</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },

  docContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfc0c0ff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 0.5,
  },

  /** HEADER **/
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },

  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },

  downloadPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#e6ecf5",
  },

  downloadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1b2b48",
  },

  /** PREVIEW **/
  previewContainer: {
    width: "100%",
    height: 240,
    backgroundColor: "white",
    position: "relative",
    overflow: "hidden",
    padding: 8,
  },

  webviewWrapper: {
    flex: 1,
    marginTop: -100,
    marginHorizontal: -8,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },

  /** VIEW DOC BUTTON **/
  accessButton: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: "#1b2b48",
    borderWidth: 1,
    borderColor: "#1b2b48",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  accessButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },

  /** FOOTER **/
  requestedFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 14,
    backgroundColor: "#f5fceeff",
    borderTopWidth: 1,
    borderTopColor: "#E6D9FF",
    gap: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#fef9ffff",
    borderTopWidth: 1,
    borderTopColor: "#E6D9FF",
    gap: 6,
  },

  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },

  footerText: {
    flex: 1,
    fontSize: 13,
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
    fontSize: 13.5,
    fontWeight: "600",
    color: "#1b2b48",
  },
});
