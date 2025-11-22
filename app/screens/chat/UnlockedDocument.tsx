// UnlockedDocument.js
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

export default function UnlockedDocument({ message }: any) {
  const googleDocId = message?.payload?.google_doc_id;
  const docTitle = message?.payload?.doc_title || "Untitled Document";

  if (!googleDocId) return null;

  const pdfUrl = `https://docs.google.com/document/d/${googleDocId}/export?format=pdf`;
  const viewUrl = `https://docs.google.com/document/d/${googleDocId}/view`;

  return (
    <View style={styles.wrapper}>
      <View style={styles.docContainer}>
        {/* Header row like screenshot */}
        <View style={styles.docHeaderRow}>
          <Text style={styles.docHeaderTitle} numberOfLines={1}>
            {docTitle}
          </Text>

          <View style={styles.docHeaderActions}>
            <TouchableOpacity
              style={styles.docDownloadButton}
              onPress={() => Linking.openURL(pdfUrl)}
              activeOpacity={0.8}
            >
              <Text style={styles.docDownloadText}>Download</Text>
              <Text style={styles.docDownloadIcon}>⬇</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL(viewUrl)}
              activeOpacity={0.7}
            >
              <Text style={styles.docViewLink}>View Doc ↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact PDF preview with border */}
        <View style={styles.docOnlyBox}>
          <WebView source={{ uri: pdfUrl }} style={styles.docOnlyWebview} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },

  docContainer: {
    width: "100%",
  },

  docHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  docHeaderTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginRight: 12,
  },

  docHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  docDownloadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
  },

  docDownloadText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    marginRight: 6,
  },

  docDownloadIcon: {
    fontSize: 13,
    color: "#111827",
  },

  docViewLink: {
    fontSize: 13,
    color: "#4B5563",
    textDecorationLine: "none",
  },

  docOnlyBox: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },

  docOnlyWebview: {
    flex: 1,
  },
});
