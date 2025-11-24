import { useLocalSearchParams } from "expo-router";
import ChatPage from "./ChatPage";
import { useEffect } from "react";

export default function ChatRoute() {
  const { threadId } = useLocalSearchParams();
  return <ChatPage threadId={threadId} />;
}
