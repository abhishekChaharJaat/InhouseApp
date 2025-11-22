// components/AttachmentsCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Attachment = {
  file_name: string;
  reference_doc_storage_id?: string;
  word_limit_exceeded?: boolean;
  status?: string;
  parsed_metadata?: any;
};

type AttachmentsPayload = {
  attachments: Attachment[];
  num_future_attachments_available?: number;
  processing_complete?: boolean;
};

type Props = {
  payload: AttachmentsPayload;
  onPressDownload?: (attachment: Attachment) => void;
};

const AttachmentsCard = ({ payload, onPressDownload }: Props) => {
  const [expanded, setExpanded] = useState(true);

  const attachments = payload?.attachments || [];
  if (attachments.length === 0) return null;

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* Header */}
        <TouchableOpacity
          style={styles.headerRow}
          activeOpacity={0.7}
          onPress={toggleExpanded}
        >
          <Text style={styles.headerText}>Attachments</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#4B5563"
          />
        </TouchableOpacity>

        {/* Divider */}
        {expanded && <View style={styles.divider} />}

        {/* Attachment rows */}
        {expanded &&
          attachments.map((att, index) => {
            const isSuccessful = att.status === "successful";

            return (
              <View
                key={`${
                  att.reference_doc_storage_id || att.file_name
                }-${index}`}
                style={[
                  styles.attachmentRow,
                  index !== attachments.length - 1 &&
                    styles.attachmentRowBorder,
                ]}
              >
                {/* Left: file icon + name */}
                <View style={styles.attachmentLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#4B5563"
                    style={styles.fileIcon}
                  />
                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {att.file_name}
                  </Text>
                </View>

                {/* Right: status + download */}
                <View style={styles.attachmentRight}>
                  {isSuccessful && (
                    <View style={styles.statusIconWrapper}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onPressDownload?.(att)}
                  >
                    <Ionicons
                      name="download-outline"
                      size={18}
                      color="#4B5563"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
      </View>
    </View>
  );
};

export default AttachmentsCard;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#919293ff",
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  attachmentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e7e7e8ff",
  },
  attachmentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  fileIcon: {
    marginRight: 8,
  },
  fileName: {
    fontSize: 13,
    color: "#111827",
    flexShrink: 1,
  },
  attachmentRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#16A34A", // green
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
});
