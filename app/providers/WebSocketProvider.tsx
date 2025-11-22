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
import { AppState } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { token } from "../data";
const WS_BASE_ENDPOINT =
  process.env.EXPO_PUBLIC_WS_BASE_ENDPOINT || "wss://api-dev.inhouse.app";

interface WebSocketContextType {
  sendMessage: (message: any, scroll?: boolean) => boolean;
  createMessage: (threadType: string, api: string, payload: any) => any;
  isConnected: boolean;
  setPendingInitialMessage: (message: string | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const hasConnected = useRef(false);
  const isConnectedRef = useRef(false);
  const retryIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const lastPongReceivedRef = useRef(Date.now());
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectionCheckIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const wasDisconnectedRef = useRef(false);
  const connectionStateRef = useRef<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const connectionMutexRef = useRef(false);
  const pendingInitialMessageRef = useRef<string | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const MAX_RETRIES = 10;
  const CONNECTION_CHECK_INTERVAL = 10000; // 10 seconds
  const PING_INTERVAL = 15000; // 15 seconds
  const CONNECTION_TIMEOUT = PING_INTERVAL * 4; // 60 seconds

  const requestIds = useSelector(
    (state: RootState) => state.message.requestIds
  );

  // Generate random string for message IDs
  const randomString = (length: number) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  // Get auth token
  const getTokenValue = async () => {
    try {
      if (token && typeof token === "string") {
        setAccessToken(token);
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
  };

  useEffect(() => {
    getTokenValue();
  }, [getToken]);

  // Clean up existing connection
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

  // Handle socket close
  const handleSocketClose = () => {
    dispatch(setRetryWSState("idle"));
    dispatch(setRetryWS(true));
    isConnectedRef.current = false;
    setIsConnected(false);

    if (retryCountRef.current >= MAX_RETRIES) {
      dispatch(setShowConnectionErrorModal(true));
      return;
    }

    const retryDelay = 3000;
    retryIntervalRef.current = setTimeout(() => {
      if (
        !socketRef.current ||
        socketRef.current.readyState === WebSocket.CLOSED ||
        socketRef.current.readyState === WebSocket.CLOSING
      ) {
        retryCountRef.current += 1;
        connectWebSocket();
      }
    }, retryDelay);
  };

  // Start ping interval
  const startPingInterval = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    pingIntervalRef.current = setInterval(() => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
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

  // Setup connection check
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
          setTimeout(() => {
            connectWebSocket();
          }, 1000);
        }
      }
    }, CONNECTION_CHECK_INTERVAL);
  };

  // Connect WebSocket
  const connectWebSocket = async () => {
    if (connectionMutexRef.current) {
      return;
    }

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

      const socket = new WebSocket(
        `${WS_BASE_ENDPOINT}/ws?token=${accessToken}`
      );
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

      socket.onerror = (error: any) => {
        connectionStateRef.current = "disconnected";
        connectionMutexRef.current = false;
        dispatch(setConnectionStatus("error"));
        console.error("WebSocket error:", error);
      };

      socket.onmessage = async (event: any) => {
        lastPongReceivedRef.current = Date.now();

        try {
          // Handle connection success text message (not JSON)
          if (event.data === "Connection successful!") {
            retryCountRef.current = 0;
            return;
          }

          // Parse JSON message
          const message = JSON.parse(event.data);

          // Handle pong
          if (message.action === "pong" || message.payload?.type === "pong") {
            return;
          }

          console.log("📨 Full message:", JSON.stringify(message, null, 2));

          // Allow messages with status_code 200 and a valid payload type
          const isValidStatusCodeMessage =
            message.status_code === 200 && message.payload?.type;
          const isInRequestIds =
            requestIds.indexOf(message.trigger_ws_message_id) !== -1;
          // Allow legacy format messages (action starts with "chat/")
          const isLegacyMessage =
            message.action && message.action.startsWith("chat/");

          console.log("🔍 Filters:", {
            isValidStatusCodeMessage,
            isInRequestIds,
            isLegacyMessage,
            action: message.action,
          });

          if (
            !isValidStatusCodeMessage &&
            !isInRequestIds &&
            !isLegacyMessage
          ) {
            console.log("❌ FILTERED OUT");
            return;
          }

          console.log("✅ ALLOWED THROUGH");

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
            console.log("received message ", message.payload);
            switch (message.payload.type) {
              case "chat_created":
                dispatch(
                  setupNewThread({
                    threadId: message.payload.thread_id,
                    threadType: "ask",
                    new_messages: [],
                  })
                );

                // Send the pending initial message if exists
                if (pendingInitialMessageRef.current) {
                  const initialMessage = pendingInitialMessageRef.current;
                  pendingInitialMessageRef.current = null;

                  // Send the initial message to the netrigger-ai-responsewly created thread
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
                console.log("📝 Message added event received");
                console.log("📦 New messages:", message.payload.new_messages);
                if (message.payload.new_messages) {
                  console.log("➕ Adding messages to Redux");
                  dispatch(
                    addMessage({
                      new_messages: message.payload.new_messages,
                      thread_id: message.payload.thread_id,
                    })
                  );
                  console.log("✅ Messages dispatched to Redux");

                  // Extract last message ID for AI trigger
                  const userMessages = message.payload.new_messages.filter(
                    (msg: any) =>
                      msg.is_user_message === true ||
                      msg.message_type === "attachment"
                  );

                  if (userMessages.length > 0) {
                    // Sort by created_at to get the actual last message
                    const sortedMessages = userMessages.sort(
                      (a: any, b: any) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                    const lastMessageId =
                      sortedMessages[sortedMessages.length - 1].id;

                    console.log(
                      "🤖 Triggering AI response for message:",
                      lastMessageId
                    );

                    // Send trigger-ai-response message
                    const triggerAIPayload = {
                      thread_id: message.payload.thread_id,
                      last_message_id: lastMessageId,
                      button_click_type: null,
                    };

                    const triggerAIMessage = createMessage(
                      "ask",
                      "trigger-ai-response",
                      triggerAIPayload
                    );

                    const aiTriggerSuccess = sendMessage(
                      triggerAIMessage,
                      true
                    );

                    if (aiTriggerSuccess) {
                      console.log("✅ AI trigger sent successfully");
                      dispatch(setAwaitingResponse(true));
                    } else {
                      console.warn("❌ Failed to send AI trigger");
                      dispatch(setAwaitingResponse(false));
                    }
                  } else {
                    // No user messages, just clear awaiting state
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
                // Validate thread_id matches current thread before enabling
                const currentThreadId =
                  requestIds.length > 0 ? message.payload.thread_id : null;

                console.log(
                  "✅ Enable messaging received for thread:",
                  message.payload.thread_id
                );

                dispatch(setMessagingDisabled(false));
                dispatch(setAwaitingResponse(false));
                break;

              case "document_generated":
                dispatch(setThreadLastMsgType("document_generated"));
                dispatch(setAwaitingResponse(false));
                break;

              default:
                break;
            }
            return;
          }

          // Handle legacy format messages
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
                dispatch(
                  setMessagingDisabled(message.payload.messaging_disabled)
                );
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

            default:
              break;
          }
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

  // Send message
  const sendMessage = (message: any, scroll?: boolean): boolean => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      dispatch(setAwaitingResponse(true));
      return true;
    } else {
      dispatch(setShowConnectionErrorModal(true));
      dispatch(setAwaitingResponse(false));
      return false;
    }
  };

  // Create message
  const createMessage = (threadType: string, api: string, payload: any) => {
    const r = (Math.random() + 1).toString(36).substring(7);
    dispatch(addRequestIds(r));
    return {
      action: `chat/${api}`,
      payload: payload,
      trigger_ws_message_id: r,
    };
  };

  // Set pending initial message
  const setPendingInitialMessage = (message: string | null) => {
    pendingInitialMessageRef.current = message;
  };

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

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
