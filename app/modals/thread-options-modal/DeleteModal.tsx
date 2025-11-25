import { resetThreadData } from "@/store/messageSlice";
import { deleteThread } from "@/store/threadSlice";
import { router, usePathname } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";

interface DeleteModalProps {
  threadId: string | null;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ threadId, onClose }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const deleteConfirm = () => {
    dispatch(deleteThread(threadId) as any).then((result: any) => {
      if (!result.error) {
        dispatch(resetThreadData());
        if (pathname !== "/history/ChatHistory") {
          router.replace("/home/Home");
        }
      }
    });
  };

  const showDeleteAlert = () => {
    onClose();

    if (!threadId) {
      Alert.alert("Error", "Unable to delete thread. Please try again.");
      return;
    }

    Alert.alert(
      "Delete Thread",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteConfirm();
          },
        },
      ]
    );
  };

  return { showDeleteAlert };
};

export default DeleteModal;

export const useDeleteThread = (threadId: string | null, onClose: () => void) => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const deleteConfirm = () => {
    dispatch(deleteThread(threadId) as any).then((result: any) => {
      if (!result.error) {
        dispatch(resetThreadData());
        if (pathname !== "/history/ChatHistory") {
          router.replace("/home/Home");
        }
      }
    });
  };

  const showDeleteAlert = () => {
    onClose();

    if (!threadId) {
      Alert.alert("Error", "Unable to delete thread. Please try again.");
      return;
    }

    Alert.alert(
      "Delete Thread",
      "Are you sure you want to delete this conversation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteConfirm();
          },
        },
      ]
    );
  };

  return { showDeleteAlert };
};
