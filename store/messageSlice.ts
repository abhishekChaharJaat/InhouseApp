import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_ENDPOINT = "https://api-dev.inhouse.app";

const initialState = {
  threadData: {
    id: null as any,
    title: "" as any,
    messages: [] as any[],
    message_feedback: {} as any,
    messaging_disabled: false,
    reference_thread_id: null as any,
    document_rating: {} as any,
  },
  loadingMessages: false,
  error: null as any,
  // WebSocket related state
  connectionStatus: "disconnected" as
    | "connected"
    | "connecting"
    | "disconnected"
    | "error",
  awaitingResponse: false,
  requestIds: [] as string[],
  chatInputMessage: "",
  isWsReconnected: false,
  showConnectionErrorModal: false,
  retryWS: false,
  retryWSState: "idle" as "idle" | "retrying",
  threadLastMsgType: "",
  shouldRedirectToChat: false,
};

export const fetchThreadMessages = createAsyncThunk(
  "chat/fetchThreadMessages",
  async ({ threadId, token }: any, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/thread/${threadId}/list-messages`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch messages";
      return rejectWithValue(errorMessage);
    }
  }
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // WebSocket connection management
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setAwaitingResponse: (state, action) => {
      state.awaitingResponse = action.payload;
    },
    setMessagingDisabled: (state, action) => {
      state.threadData.messaging_disabled = action.payload;
    },
    // Message management
    addMessage: (state, action) => {
      const newMessages = action.payload.new_messages || [];
      state.threadData.messages = [
        ...state.threadData.messages,
        ...newMessages,
      ];
    },
    setChatInputMessage: (state, action) => {
      state.chatInputMessage = action.payload;
    },
    // Thread management
    setupNewThread: (state, action) => {
      const { threadId, new_messages = [] } = action.payload;
      state.threadData.id = threadId;
      state.threadData.messages = new_messages;
      state.shouldRedirectToChat = true; // Set flag to redirect
    },
    clearRedirectFlag: (state) => {
      state.shouldRedirectToChat = false;
    },
    updateThreadDataTitle: (state, action) => {
      if (action.payload.thread_id === state.threadData.id) {
        state.threadData.title = action.payload.title;
      }
    },
    // Request tracking
    addRequestIds: (state, action) => {
      state.requestIds.push(action.payload);
    },
    // Connection error handling
    setShowConnectionErrorModal: (state, action) => {
      state.showConnectionErrorModal = action.payload;
    },
    setRetryWS: (state, action) => {
      state.retryWS = action.payload;
    },
    setRetryWSState: (state, action) => {
      state.retryWSState = action.payload;
    },
    setIsWsReconnected: (state, action) => {
      state.isWsReconnected = action.payload;
    },
    setThreadLastMsgType: (state, action) => {
      state.threadLastMsgType = action.payload;
    },
    resetThreadData: (state) => {
      state.threadData = {
        id: null,
        title: "",
        messages: [],
        message_feedback: {},
        messaging_disabled: false,
        reference_thread_id: null,
        document_rating: {},
      };
      state.threadLastMsgType = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreadMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(fetchThreadMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const {
          thread_id,
          thread_title,
          messages,
          message_feedback,
          messaging_disabled,
          reference_thread_id,
          document_rating,
        } = action.payload;
        state.threadData = {
          id: thread_id,
          title: thread_title,
          messages,
          message_feedback,
          messaging_disabled,
          reference_thread_id,
          document_rating,
        };
      })
      .addCase(fetchThreadMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
        console.log("Error ", action.payload);
      });
  },
});

export const {
  clearError,
  setConnectionStatus,
  setAwaitingResponse,
  setMessagingDisabled,
  addMessage,
  setChatInputMessage,
  setupNewThread,
  clearRedirectFlag,
  updateThreadDataTitle,
  addRequestIds,
  setShowConnectionErrorModal,
  setRetryWS,
  setRetryWSState,
  setIsWsReconnected,
  setThreadLastMsgType,
  resetThreadData,
} = messageSlice.actions;
export default messageSlice.reducer;
