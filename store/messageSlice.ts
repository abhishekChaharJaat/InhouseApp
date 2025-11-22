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

export const { clearError } = messageSlice.actions;
export default messageSlice.reducer;
