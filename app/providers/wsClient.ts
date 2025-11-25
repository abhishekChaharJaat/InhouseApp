// @ts-nocheck
import { store } from "@/store";
import {
  addMessage,
  addRequestIds,
  setAwaitingResponse,
  setChatInputMessage,
  setMessagingDisabled,
  setThreadLastMsgType,
  setupNewThread,
  updateThreadDataTitle,
} from "@/store/messageSlice";
import { getAllThreads } from "@/store/threadSlice";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
const WS_BASE_ENDPOINT =
  process.env.EXPO_PUBLIC_WS_BASE_ENDPOINT || "wss://api-dev.inhouse.app";

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let wsInstance: WebSocket | null = null;
let pendingInitialMessage: string | null = null;

/**
 * Set the WebSocket instance
 */
export const setWebSocketInstance = (ws: WebSocket | null) => {
  wsInstance = ws;
};

/**
 * Get the WebSocket instance
 */
export const getWebSocketInstance = (): WebSocket | null => {
  return wsInstance;
};

/**
 * Set pending initial message (for thread creation flow)
 */
export const setPendingInitialMessage = (message: string | null) => {
  pendingInitialMessage = message;
  console.log("Pending message set:", message);
};

/**
 * Get pending initial message
 */
export const getPendingInitialMessage = (): string | null => {
  return pendingInitialMessage;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const randomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

/**
 * Handle new format WebSocket messages (status_code: 200)
 */
export const handleNewFormatMessage = (message: any) => {
  const dispatch = store.dispatch;

  switch (message.payload.type) {
    case "chat_created":
      const threadId = message.payload.thread_id;
      dispatch(
        setupNewThread({
          threadId: threadId,
          threadType: "ask",
          new_messages: [],
        })
      );
      console.log("Thread created:", threadId);

      // Send pending initial message if exists
      if (pendingInitialMessage && wsInstance) {
        setTimeout(() => {
          const msg = addMessageToThread(threadId, pendingInitialMessage!);
          sendWebSocketMessage(wsInstance, msg);
          pendingInitialMessage = null; // Clear after sending
        }, 500);
      }
      break;

    case "message_added":
      if (message.payload.new_messages) {
        dispatch(
          addMessage({
            new_messages: message.payload.new_messages,
            thread_id: message.payload.thread_id,
          })
        );
        console.log(
          "Messages added:",
          message.payload.new_messages.length,
          "messages"
        );

        // Trigger AI response for user messages
        const userMessages = message.payload.new_messages.filter(
          (msg: any) =>
            msg.is_user_message === true || msg.message_type === "attachment"
        );

        if (userMessages.length > 0 && wsInstance) {
          const sortedMessages = userMessages.sort(
            (a: any, b: any) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          const lastMessageId = sortedMessages[sortedMessages.length - 1].id;

          const triggerMsg = triggerAIResponse(
            message.payload.thread_id,
            lastMessageId,
            null
          );

          if (sendWebSocketMessage(wsInstance, triggerMsg)) {
            dispatch(setAwaitingResponse(true));
            dispatch(setMessagingDisabled(true));
          } else {
            dispatch(setAwaitingResponse(false));
            dispatch(setMessagingDisabled(false));
          }
        }
        // NOTE: Don't set awaitingResponse = false here for AI messages
        // The enable_messaging event will handle that
      }
      dispatch(setChatInputMessage(""));
      break;

    case "new_title":
      dispatch(
        updateThreadDataTitle({
          thread_id: message.payload.thread_id,
          title: message.payload.title,
        })
      );
      dispatch(getAllThreads() as any);
      console.log("Title updated:", message.payload.title);
      break;

    case "enable_messaging":
      // Validate thread_id matches current thread before enabling
      const enableMsgState = store.getState();
      const enableMsgCurrentThreadId = enableMsgState.message.threadData?.id;

      if (message.payload.thread_id === enableMsgCurrentThreadId) {
        dispatch(setMessagingDisabled(false));
        dispatch(setAwaitingResponse(false));
        console.log("Messaging enabled for thread:", message.payload.thread_id);
      } else {
        console.log(
          "Ignoring enable_messaging for different thread:",
          message.payload.thread_id,
          "current:",
          enableMsgCurrentThreadId
        );
      }
      break;

    case "document_generated":
      console.log("document_generated:", message.payload);
      // Add the document as a message to threadData.messages
      const docMessage = {
        id: `doc-${Date.now()}`,
        is_user_message: false,
        created_at: new Date().toISOString(),
        message_type: "document_generated",
        payload: {
          doc_title: message.payload.doc_title,
          google_doc_id: message.payload.google_doc_id,
        },
      };
      dispatch(
        addMessage({
          new_messages: [docMessage],
          thread_id: message.payload.thread_id,
        })
      );
      dispatch(setThreadLastMsgType("document_generated"));
      dispatch(setAwaitingResponse(false));
      break;
    case "locked_document_generated":
      console.log("locked_document_generated:", message.payload);
      // Add the locked document as a message to threadData.messages
      const lockedDocMessage = {
        id: `locked-doc-${Date.now()}`,
        is_user_message: false,
        created_at: new Date().toISOString(),
        message_type: "locked_document_generated",
        payload: {
          doc_title: message.payload.doc_title,
          google_doc_id: message.payload.google_doc_id,
        },
      };
      dispatch(
        addMessage({
          new_messages: [lockedDocMessage],
          thread_id: message.payload.thread_id,
        })
      );
      dispatch(setThreadLastMsgType("locked_document_generated"));
      dispatch(setAwaitingResponse(false));
      break;
    case "pong":
      // Health check response - no action needed
      break;

    default:
      console.log("Unknown message type:", message.payload.type);
  }
};

/**
 * Handle legacy format WebSocket messages
 */
export const handleLegacyMessage = (message: any) => {
  const dispatch = store.dispatch;

  switch (message.action) {
    case "chat/thread-created":
      dispatch(
        setupNewThread({
          threadId: message.payload.thread_id,
          threadType: "ask",
          new_messages: message.payload.new_messages,
        })
      );
      console.log("Legacy: Thread created:", message.payload.thread_id);
      break;

    case "chat/message-added":
      dispatch(setChatInputMessage(""));
      dispatch(setAwaitingResponse(true));
      console.log("Legacy: Message added");
      break;

    case "chat/new-message-available":
      if (message.payload.new_messages) {
        dispatch(
          addMessage({
            new_messages: message.payload.new_messages,
          })
        );
      }
      if (message.payload.messaging_disabled !== undefined) {
        dispatch(setMessagingDisabled(message.payload.messaging_disabled));
      }
      dispatch(setAwaitingResponse(false));
      console.log("Legacy: New messages available");
      break;

    case "ai_title_available":
      dispatch(
        updateThreadDataTitle({
          thread_id: message.payload.thread_id,
          title: message.payload.title,
        })
      );
      console.log("Legacy: AI title available:", message.payload.title);
      break;

    default:
      console.log("Unknown legacy action:", message.action);
  }
};

/**
 * Main message handler - routes to appropriate handler
 */
export const handleWebSocketMessage = (event: MessageEvent) => {
  try {
    // Ignore connection success message
    if (event.data === "Connection successful!") {
      console.log("WebSocket connection successful");
      return;
    }

    const message = JSON.parse(event.data);

    // Handle pong
    if (message.action === "pong" || message.payload?.type === "pong") {
      return;
    }

    // Get requestIds from store
    const state = store.getState();
    const requestIds = state.message.requestIds || [];
    const currentThreadId = state.message.threadData?.id;

    // Filter messages
    const isValidStatusCodeMessage =
      message.status_code === 200 && message.payload?.type;
    const isInRequestIds =
      requestIds.indexOf(message.trigger_ws_message_id) !== -1;
    const isLegacyMessage =
      message.action && message.action.startsWith("chat/");

    // Allow enable_messaging messages through - these are critical for re-enabling chat
    const isEnableMessagingMessage =
      message.status_code === 200 && message.payload?.type === "enable_messaging";

    // Allow messages for current thread
    const isCurrentThreadMessage =
      message.payload?.thread_id === currentThreadId;

    if (!isValidStatusCodeMessage && !isInRequestIds && !isLegacyMessage && !isEnableMessagingMessage && !isCurrentThreadMessage) {
      console.log("Message filtered out:", message);
      return;
    }

    // Handle error messages
    if (
      message.payload?.error ||
      message?.error ||
      message?.status_code > 299
    ) {
      console.error("WebSocket error message:", message);
      store.dispatch(setAwaitingResponse(false));
      store.dispatch(setMessagingDisabled(false));
      Alert.alert(
        "Error",
        message.payload?.error || message?.error || "An error occurred"
      );
      return;
    }

    // Route to appropriate handler
    if (message.status_code === 200 && message.payload?.type) {
      handleNewFormatMessage(message);
    } else if (message.action) {
      handleLegacyMessage(message);
    }
  } catch (e) {
    console.error("Error parsing WebSocket message:", e);
  }
};

// ============================================================================
// MESSAGE CREATION & SENDING
// ============================================================================

/**
 * Create a WebSocket message with unique ID
 */
export const createMessage = (
  threadType: string,
  api: string,
  payload: any
): any => {
  const requestId = (Math.random() + 1).toString(36).substring(7);
  store.dispatch(addRequestIds(requestId));

  return {
    action: `chat/${api}`,
    payload: payload,
    trigger_ws_message_id: requestId,
  };
};

/**
 * Send a WebSocket message
 */
export const sendWebSocketMessage = (
  ws: WebSocket | null = null,
  message: any
): boolean => {
  // Use provided ws or fall back to stored instance
  const websocket = ws || wsInstance;

  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    Alert.alert(
      "Connection Error",
      "WebSocket is not connected. Please try again."
    );
    store.dispatch(setAwaitingResponse(false));
    return false;
  }

  try {
    websocket.send(JSON.stringify(message));
    store.dispatch(setAwaitingResponse(true));
    console.log("Message sent:", message.action);
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    Alert.alert("Error", "Failed to send message. Please try again.");
    store.dispatch(setAwaitingResponse(false));
    return false;
  }
};

/**
 * Send a ping message to keep connection alive
 */
export const sendPing = (ws: WebSocket | null): void => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const pingMessage = {
      trigger_ws_message_id: randomString(10),
      action: "ping",
      payload: null,
    };
    try {
      ws.send(JSON.stringify(pingMessage));
    } catch (e) {
      console.warn("Failed to send ping:", e);
    }
  }
};

// ============================================================================
// SPECIFIC MESSAGE TYPES
// ============================================================================

/**
 * Create a new thread
 */
export const createThreadMessage = () => {
  return createMessage("chat", "create-thread", {});
};

/**
 * Add a message to a thread
 */
export const addMessageToThread = (
  threadId: string,
  messageText: string,
  messageType?: string
) => {
  if (messageType && messageType === "draft") {
    return createMessage("draft", "add-message", {
      thread_id: threadId,
      message: messageText,
    });
  } else {
    return createMessage("ask", "add-message", {
      thread_id: threadId,
      message: messageText,
    });
  }
};

/**
 * Trigger AI response for a message
 */
export const triggerAIResponse = (
  threadId: string,
  lastMessageId: string,
  buttonClickType: string | null = null
) => {
  return createMessage("ask", "trigger-ai-response", {
    thread_id: threadId,
    last_message_id: lastMessageId,
    button_click_type: buttonClickType,
  });
};

// ============================================================================

export const connectAuthWebSocket = async (
  getToken: () => Promise<string | null>
): Promise<WebSocket | null> => {
  try {
    const token = await getToken();

    if (!token) {
      Alert.alert("WebSocket Error", "No token found from Clerk.");
      return null;
    }
    const wsUrl = `${WS_BASE_ENDPOINT}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    return ws;
  } catch (error) {
    console.error("Error getting token or creating WebSocket:", error);
    Alert.alert("WebSocket Error", "Unable to start WebSocket connection.");
    return null;
  }
};

export const connectAnonymousWebSocket =
  async (): Promise<WebSocket | null> => {
    try {
      const anonymousId = await getAnonymousUserId();
      const wsUrl = `${WS_BASE_ENDPOINT}/ws?anonymous_user_id=${encodeURIComponent(
        anonymousId
      )}`;
      const ws = new WebSocket(wsUrl);
      return ws;
    } catch (error) {
      return null;
    }
  };

export const getAnonymousUserId = async (): Promise<string> => {
  try {
    // Try to get existing ID
    let anonymousId = await SecureStore.getItemAsync("anonymous_user_id");
    if (!anonymousId) {
      // Generate new ID if doesn't exist
      anonymousId = generateAnonymousId();
      await SecureStore.setItemAsync("anonymous_user_id", anonymousId);
      console.log("Generated new anonymous ID:", anonymousId);
    }

    return anonymousId;
  } catch (error) {
    console.error("Error managing anonymous ID:", error);
    // Fallback to generating a new ID if storage fails
    return generateAnonymousId();
  }
};

const generateAnonymousId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
