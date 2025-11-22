import { RootState } from "@/store";
import {
  addMessage,
  addRequestIds,
  setAwaitingResponse,
  setChatInputMessage,
  setConnectionStatus,
  setIsWsReconnected,
  setMessagingDisabled,
  setRetryWS,
  setRetryWSState,
  setShowConnectionErrorModal,
  setThreadLastMsgType,
  setupNewThread,
  updateThreadDataTitle,
} from "@/store/messageSlice";
import { useAuth } from "@clerk/clerk-expo";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { token } from "../data";

// ============================================================================
// CONSTANTS
// ============================================================================

const WS_BASE_ENDPOINT =
  process.env.EXPO_PUBLIC_WS_BASE_ENDPOINT || "wss://api-dev.inhouse.app";

const MAX_RETRIES = 10;
const CONNECTION_CHECK_INTERVAL = 10000; // 10 seconds
const PING_INTERVAL = 15000; // 15 seconds
const CONNECTION_TIMEOUT = PING_INTERVAL * 4; // 60 seconds

// ============================================================================
// CONTEXT
// ============================================================================

const WebSocketContext = createContext(null);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const randomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const WebSocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  // Refs
  /** @type {React.MutableRefObject<WebSocket | null>} */
  const socketRef = useRef(null);
  const hasConnected = useRef(false);
  const isConnectedRef = useRef(false);
  /** @type {React.MutableRefObject<ReturnType<typeof setTimeout> | null>} */
  const retryIntervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const lastPongReceivedRef = useRef(Date.now());
  /** @type {React.MutableRefObject<ReturnType<typeof setInterval> | null>} */
  const pingIntervalRef = useRef(null);
  /** @type {React.MutableRefObject<ReturnType<typeof setInterval> | null>} */
  const connectionCheckIntervalRef = useRef(null);
  const wasDisconnectedRef = useRef(false);
  const connectionStateRef = useRef("disconnected");
  const connectionMutexRef = useRef(false);
  const pendingInitialMessageRef = useRef(null);

  // State
  const [accessToken, setAccessToken] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Redux state
  const requestIds = useSelector((state) => state.message.requestIds);

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  const cleanupExistingConnection = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    if (retryIntervalRef.current) {
      clearTimeout(retryIntervalRef.current);
      retryIntervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onclose = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;

      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }

    isConnectedRef.current = false;
    setIsConnected(false);
    connectionStateRef.current = "disconnected";
  };

  const handleSocketClose = () => {
    dispatch(setRetryWSState("idle"));
    dispatch(setRetryWS(true));
    isConnectedRef.current = false;
    setIsConnected(false);

    if (retryCountRef.current >= MAX_RETRIES) {
      dispatch(setShowConnectionErrorModal(true));
      return;
    }

    retryIntervalRef.current = setTimeout(() => {
      if (
        !socketRef.current ||
        socketRef.current.readyState === WebSocket.CLOSED ||
        socketRef.current.readyState === WebSocket.CLOSING
      ) {
        retryCountRef.current += 1;
        connectWebSocket();
      }
    }, 3000);
  };

  const startPingInterval = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const pingMessage = {
          trigger_ws_message_id: randomString(10),
          action: "ping",
          payload: null,
        };
        try {
          socketRef.current.send(JSON.stringify(pingMessage));
        } catch (e) {
          console.warn("Failed to send ping", e);
        }
      }
    }, PING_INTERVAL);
  };

  const setupConnectionCheck = () => {
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
    }

    connectionCheckIntervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastPong = currentTime - lastPongReceivedRef.current;

      if (timeSinceLastPong > CONNECTION_TIMEOUT) {
        console.warn("Connection timeout detected");
        if (connectionStateRef.current === "connected") {
          connectionStateRef.current = "disconnected";
          cleanupExistingConnection();
          setTimeout(() => connectWebSocket(), 1000);
        }
      }
    }, CONNECTION_CHECK_INTERVAL);
  };

  const connectWebSocket = async () => {
    if (connectionMutexRef.current) return;
    if (
      connectionStateRef.current === "connected" ||
      connectionStateRef.current === "connecting"
    ) {
      return;
    }

    if (retryCountRef.current >= MAX_RETRIES) {
      dispatch(setShowConnectionErrorModal(true));
      cleanupExistingConnection();
      return;
    }

    connectionMutexRef.current = true;
    connectionStateRef.current = "connecting";

    try {
      cleanupExistingConnection();

      if (!accessToken) {
        connectionMutexRef.current = false;
        connectionStateRef.current = "disconnected";
        return;
      }

      const socket = new WebSocket(`${WS_BASE_ENDPOINT}/ws?token=${accessToken}`);
      socketRef.current = socket;
      dispatch(setConnectionStatus("connecting"));

      socket.onopen = () => {
        isConnectedRef.current = true;
        setIsConnected(true);
        connectionStateRef.current = "connected";
        connectionMutexRef.current = false;
        lastPongReceivedRef.current = Date.now();
        retryCountRef.current = 0;

        dispatch(setRetryWSState("idle"));
        dispatch(setRetryWS(false));
        dispatch(setShowConnectionErrorModal(false));
        dispatch(setConnectionStatus("connected"));

        if (wasDisconnectedRef.current) {
          dispatch(setIsWsReconnected(true));
          wasDisconnectedRef.current = false;
        }

        startPingInterval();
        setupConnectionCheck();
      };

      socket.onclose = () => {
        isConnectedRef.current = false;
        setIsConnected(false);
        connectionStateRef.current = "disconnected";
        connectionMutexRef.current = false;

        dispatch(setIsWsReconnected(false));
        dispatch(setConnectionStatus("disconnected"));
        wasDisconnectedRef.current = true;

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        handleSocketClose();
      };

      socket.onerror = (error) => {
        connectionStateRef.current = "disconnected";
        connectionMutexRef.current = false;
        dispatch(setConnectionStatus("error"));
        console.error("WebSocket error:", error);
      };

      socket.onmessage = async (event) => {
        lastPongReceivedRef.current = Date.now();

        try {
          if (event.data === "Connection successful!") {
            retryCountRef.current = 0;
            return;
          }

          const message = JSON.parse(event.data);

          // Handle pong
          if (message.action === "pong" || message.payload?.type === "pong") {
            return;
          }

          // Filter messages
          const isValidStatusCodeMessage =
            message.status_code === 200 && message.payload?.type;
          const isInRequestIds =
            requestIds.indexOf(message.trigger_ws_message_id) !== -1;
          const isLegacyMessage =
            message.action && message.action.startsWith("chat/");

          if (
            !isValidStatusCodeMessage &&
            !isInRequestIds &&
            !isLegacyMessage
          ) {
            return;
          }

          // Handle error messages
          if (
            message.payload?.error ||
            message?.error ||
            message?.status_code > 299
          ) {
            console.error("WebSocket error message:", message);
            dispatch(setAwaitingResponse(false));
            dispatch(setMessagingDisabled(false));
            return;
          }

          // Handle new format messages
          if (message.status_code === 200 && message.payload?.type) {
            handleNewFormatMessage(message);
            return;
          }

          // Handle legacy format messages
          handleLegacyMessage(message);
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };
    } catch (error) {
      connectionMutexRef.current = false;
      connectionStateRef.current = "disconnected";
      console.error("Error creating WebSocket:", error);
      handleSocketClose();
    }
  };

  // ============================================================================
  // MESSAGE HANDLERS
  // ============================================================================

  const handleNewFormatMessage = (message) => {
    switch (message.payload.type) {
      case "chat_created":
        dispatch(
          setupNewThread({
            threadId: message.payload.thread_id,
            threadType: "ask",
            new_messages: [],
          })
        );

        // Send pending initial message
        if (pendingInitialMessageRef.current) {
          const initialMessage = pendingInitialMessageRef.current;
          pendingInitialMessageRef.current = null;

          setTimeout(() => {
            const msg = createMessage("ask", "add-message", {
              thread_id: message.payload.thread_id,
              message: initialMessage,
            });
            sendMessage(msg, true);
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

          // Trigger AI response for user messages
          const userMessages = message.payload.new_messages.filter(
            (msg) =>
              msg.is_user_message === true || msg.message_type === "attachment"
          );

          if (userMessages.length > 0) {
            const sortedMessages = userMessages.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
            const lastMessageId = sortedMessages[sortedMessages.length - 1].id;

            const triggerAIMessage = createMessage("ask", "trigger-ai-response", {
              thread_id: message.payload.thread_id,
              last_message_id: lastMessageId,
              button_click_type: null,
            });

            if (sendMessage(triggerAIMessage, true)) {
              dispatch(setAwaitingResponse(true));
            } else {
              dispatch(setAwaitingResponse(false));
            }
          } else {
            dispatch(setAwaitingResponse(false));
          }
        } else {
          dispatch(setAwaitingResponse(false));
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
        break;

      case "enable_messaging":
        dispatch(setMessagingDisabled(false));
        dispatch(setAwaitingResponse(false));
        break;

      case "document_generated":
        dispatch(setThreadLastMsgType("document_generated"));
        dispatch(setAwaitingResponse(false));
        break;
    }
  };

  const handleLegacyMessage = (message) => {
    switch (message.action) {
      case "chat/thread-created":
        dispatch(
          setupNewThread({
            threadId: message.payload.thread_id,
            threadType: "ask",
            new_messages: message.payload.new_messages,
          })
        );
        break;

      case "chat/message-added":
        dispatch(setChatInputMessage(""));
        dispatch(setAwaitingResponse(true));
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
        break;

      case "ai_title_available":
        dispatch(
          updateThreadDataTitle({
            thread_id: message.payload.thread_id,
            title: message.payload.title,
          })
        );
        break;
    }
  };

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  const sendMessage = (message, scroll) => {
    // Check connection before sending
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      Alert.alert(
        "Connection Error",
        "WebSocket is not connected. Please try again."
      );
      dispatch(setShowConnectionErrorModal(true));
      dispatch(setAwaitingResponse(false));
      return false;
    }

    try {
      socketRef.current.send(JSON.stringify(message));
      dispatch(setAwaitingResponse(true));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
      dispatch(setAwaitingResponse(false));
      return false;
    }
  };

  const createMessage = (threadType, api, payload) => {
    const r = (Math.random() + 1).toString(36).substring(7);
    dispatch(addRequestIds(r));
    return {
      action: `chat/${api}`,
      payload: payload,
      trigger_ws_message_id: r,
    };
  };

  const setPendingInitialMessage = (message) => {
    pendingInitialMessageRef.current = message;
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Get auth token
  useEffect(() => {
    const getTokenValue = async () => {
      try {
        if (token && typeof token === "string") {
          setAccessToken(token);
        }
      } catch (error) {
        console.error("Error getting token:", error);
      }
    };
    getTokenValue();
  }, [getToken]);

  // Initial connection
  useEffect(() => {
    if (!hasConnected.current && accessToken) {
      hasConnected.current = true;
      connectWebSocket();
    }

    return () => {
      cleanupExistingConnection();
    };
  }, [accessToken]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        lastPongReceivedRef.current = Date.now();
        dispatch(setShowConnectionErrorModal(false));

        if (connectionStateRef.current === "disconnected") {
          connectWebSocket();
        } else if (connectionStateRef.current === "connected") {
          const pingMessage = {
            action: "ping",
            payload: null,
            trigger_ws_message_id: randomString(10),
          };
          try {
            socketRef.current?.send(JSON.stringify(pingMessage));
          } catch (e) {
            console.warn("Failed to send ping on app focus", e);
            connectionStateRef.current = "disconnected";
            connectWebSocket();
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        createMessage,
        isConnected,
        setPendingInitialMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
