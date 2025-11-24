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
};

export const fetchThreadMessages = createAsyncThunk(
  "chat/fetchThreadMessages",
  async ({ threadId }: any, { rejectWithValue, getState }) => {
    const state = getState() as any;
    const token = state.auth.token;
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

export const getAllGeneratedDocs = createAsyncThunk(
  "threads/getAllGeneratedDocs",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as any;
    const token = state.auth.token;
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
      if (new_messages && Array.isArray(new_messages)) {
        state.threadData.messages = [
          ...state.threadData.messages,
          ...new_messages,
        ];
      }
    },
    updateThreadDataTitle: (state, action) => {
      const { title } = action.payload;
      state.threadData.title = title;
    },
    setThreadLastMsgType: (state, action) => {
      state.threadLastMsgType = action.payload;
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
} = messageSlice.actions;
export default messageSlice.reducer;
