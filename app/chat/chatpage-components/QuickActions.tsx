// components/QuickActions.tsx
import { handleLegalReviewButtonClicked } from "@/app/helpers";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const QuickActions = ({ message }: any) => {
  const dispatch = useDispatch();
  const buttons = message?.payload?.buttons || [];
  const threadData = useSelector((state: any) => state.message.threadData);
  const userMetadata = useSelector(
    (state: any) => state.onboarding.userMetadata
  );
  const messages = threadData?.messages;
  // If no messages, don't render anything
  if (!messages || messages.length === 0) return null;
  const lastMessage = messages[messages.length - 1];
  // Change this condition to match your actual "quick" flag/field
  const isLastMessageQuick = lastMessage?.id === message?.id;
  if (!isLastMessageQuick) return null;
  if (!buttons || buttons.length === 0) return null;

  const handleBtnClick = (button: any) => {
    switch (button.type) {
      case "legal_review_request": {
        handleLegalReviewButtonClicked(
          button,
          dispatch,
          userMetadata,
          threadData?.id
        );
        break;
      }
    }
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.quickActionsContainer}>
        {buttons?.map((button: any, index: any) => {
          if (button.hide_from_user) return null;

          const isLegalReview = button.type === "legal_review_request";
          const isDraft = button.type === "draft";
          const fastDraft = button.type === "skip_to_draft";

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickActionPill,
                isLegalReview && styles.quickActionPillPrimary,
              ]}
              activeOpacity={0.7}
              onPress={() => handleBtnClick(button)}
            >
              <View style={styles.quickActionContent}>
                {isLegalReview && (
                  <Ionicons
                    name="briefcase-outline"
                    size={16}
                    color="#0B1F33" // dark navy
                    style={styles.quickActionIcon}
                  />
                )}

                {isDraft && (
                  <Ionicons
                    name="leaf-outline"
                    size={16}
                    color="#0FAF62" // green icon
                    style={styles.quickActionIcon}
                  />
                )}

                {fastDraft && (
                  <Ionicons
                    name="leaf-outline"
                    size={16}
                    color="#0FAF62" // green icon
                    style={styles.quickActionIcon}
                  />
                )}

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.quickActionText,
                    isLegalReview && styles.quickActionTextPrimary,
                  ]}
                >
                  {button?.text}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickActionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 12,
    marginBottom: 12,
    maxWidth: "95%",
  },
  quickActionPillPrimary: {
    borderColor: "#0B1F33",
    backgroundColor: "#F8FAFF",
  },
  quickActionContent: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  quickActionIcon: {
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 15,
    color: "#0B1F33",
    fontWeight: "500",
    flexShrink: 1,
  },
  quickActionTextPrimary: {
    fontWeight: "600",
  },
});
