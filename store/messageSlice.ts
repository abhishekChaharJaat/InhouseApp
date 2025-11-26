import { getAnonymousUserId } from "@/app/utils/anonymousId";
import { getToken } from "@/app/utils/helpers";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_ENDPOINT = "https://api-dev.inhouse.app";

export const fetchThreadMessages = createAsyncThunk(
  "chat/fetchThreadMessages",
  async (threadId: any, { rejectWithValue }) => {
    const token = await getToken();
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

// Fetch messages for unauthenticated (anonymous) users on try page
export const fetchAnonymousThreadMessages = createAsyncThunk(
  "chat/fetchAnonymousThreadMessages",
  async (threadId: any, { rejectWithValue }) => {
    try {
      const anonymousId = await getAnonymousUserId();
      const url = `${BASE_ENDPOINT}/api/thread/${threadId}/list-messages`;
      const headers = { "anonymous-user-id": anonymousId };
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

export const getAllGeneratedDocs = createAsyncThunk(
  "threads/getAllGeneratedDocs",
  async (_, { rejectWithValue }) => {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/user/document-library`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch documents";
      return rejectWithValue(errorMessage);
    }
  }
);

export const generateSharedId = createAsyncThunk(
  "threads/generateSharedId",
  async (threadId: string, { rejectWithValue }) => {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/thread/${threadId}/share`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(url, {}, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to generate share link";
      return rejectWithValue(errorMessage);
    }
  }
);

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
  // Documents library state
  documents: [] as any[],
  loadingDocuments: false,
  documentsError: null as any,
  // Chat input state
  chatInputMessage: "",
  shouldRedirectToChat: false,
  // WebSocket state
  requestIds: [] as string[],
  awaitingResponse: false,
  threadLastMsgType: null as any,
  // Loading message state
  loadingMessageType: "DEFAULT" as string,
  loadingMessagePayload: null as any,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setChatInputMessage: (state, action) => {
      state.chatInputMessage = action.payload;
    },
    clearRedirectFlag: (state) => {
      state.shouldRedirectToChat = false;
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
      state.awaitingResponse = false;
    },
    // WebSocket actions
    addRequestIds: (state, action) => {
      state.requestIds.push(action.payload);
    },
    setAwaitingResponse: (state, action) => {
      state.awaitingResponse = action.payload;
    },
    setMessagingDisabled: (state, action) => {
      state.threadData.messaging_disabled = action.payload;
    },
    setupNewThread: (state, action) => {
      const { threadId, new_messages } = action.payload;
      state.threadData = {
        id: threadId,
        title: "",
        messages: new_messages || [],
        message_feedback: {},
        messaging_disabled: false,
        reference_thread_id: null,
        document_rating: {},
      };
      state.shouldRedirectToChat = true;
    },
    addMessage: (state, action) => {
      const { new_messages } = action.payload;
      console.log("new message ", new_messages);
      if (new_messages && Array.isArray(new_messages)) {
        // Get existing message IDs to prevent duplicates
        const existingIds = new Set(
          state.threadData.messages.map((msg: any) => msg.id)
        );
        // Only add messages that don't already exist
        const uniqueNewMessages = new_messages.filter(
          (msg: any) => !existingIds.has(msg.id)
        );
        if (uniqueNewMessages.length > 0) {
          state.threadData.messages = [
            ...state.threadData.messages,
            ...uniqueNewMessages,
          ];
        }
      }
    },
    updateThreadDataTitle: (state, action) => {
      const { title } = action.payload;
      state.threadData.title = title;
    },
    setThreadLastMsgType: (state, action) => {
      state.threadLastMsgType = action.payload;
    },
    // Loading message type for shimmer
    updateLoadingMessageType: (state, action) => {
      state.loadingMessageType = action.payload;
    },
    setLoadingMessagePayload: (state, action) => {
      state.loadingMessagePayload = action.payload;
    },
    resetLoadingMessageType: (state) => {
      state.loadingMessageType = "DEFAULT";
      state.loadingMessagePayload = null;
    },
    // Add legal review message when referral is stored successfully
    addLegalReviewMessage: (state) => {
      const legalReviewMessage = {
        id: `legal-review-${Date.now()}`,
        is_user_message: false,
        created_at: new Date().toISOString(),
        message_type: "legal_review_message",
        payload: null,
      };
      state.threadData.messages = [
        ...state.threadData.messages,
        legalReviewMessage,
      ];
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
      })
      // Anonymous thread messages (for try page / unauthenticated users)
      .addCase(fetchAnonymousThreadMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(fetchAnonymousThreadMessages.fulfilled, (state, action) => {
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
          message_feedback: message_feedback || {},
          messaging_disabled,
          reference_thread_id,
          document_rating: document_rating || {},
        };
      })
      .addCase(fetchAnonymousThreadMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
        console.log("Error fetching anonymous messages: ", action.payload);
      })
      .addCase(getAllGeneratedDocs.pending, (state) => {
        state.loadingDocuments = true;
        state.documentsError = null;
      })
      .addCase(getAllGeneratedDocs.fulfilled, (state, action) => {
        state.loadingDocuments = false;
        state.documents = action.payload;
      })
      .addCase(getAllGeneratedDocs.rejected, (state, action) => {
        state.loadingDocuments = false;
        state.documentsError = action.payload;
        console.log("Error fetching documents: ", action.payload);
      });
  },
});

export const {
  clearError,
  setChatInputMessage,
  clearRedirectFlag,
  resetThreadData,
  addRequestIds,
  setAwaitingResponse,
  setMessagingDisabled,
  setupNewThread,
  addMessage,
  updateThreadDataTitle,
  setThreadLastMsgType,
  updateLoadingMessageType,
  setLoadingMessagePayload,
  resetLoadingMessageType,
  addLegalReviewMessage,
} = messageSlice.actions;
export default messageSlice.reducer;
