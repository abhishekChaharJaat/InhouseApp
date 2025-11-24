import { useLocalSearchParams } from "expo-router";
import ChatPage from "./ChatPage";

export default function ChatRoute() {
  const { threadId } = useLocalSearchParams();
  return <ChatPage threadId={threadId} />;
}
