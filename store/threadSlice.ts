import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_ENDPOINT = "https://api-dev.inhouse.app";

const initialState = {
  // Threads list state
  threads: {
    today: [] as any[],
    yesterday: [] as any[],
    previous_7_days: [] as any[],
    previous_30_days: [] as any[],
    older: [] as any[],
  },
  loadingThreads: false,
  threadsError: null as any,
  deletingThread: false,
  deleteError: null as any,
};

export const getAllThreads = createAsyncThunk(
  "threads/getAllThreads",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as any;
    const token = state.auth.token;
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/user/list-threads`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch threads";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteThread = createAsyncThunk(
  "threads/deleteThread",
  async ({ id }: any, { rejectWithValue, getState }) => {
    const state = getState() as any;
    const token = state.auth.token;
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/thread/${id}/delete`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(url, { headers });
      return { response: response.data, threadId: id };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to delete thread";
      return rejectWithValue(errorMessage);
    }
  }
);

const threadSlice = createSlice({
  name: "thread",
  initialState,
  reducers: {
    clearThreadsError: (state) => {
      state.threadsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllThreads.pending, (state) => {
        state.loadingThreads = true;
        state.threadsError = null;
      })
      .addCase(getAllThreads.fulfilled, (state, action) => {
        state.loadingThreads = false;
        state.threads = action.payload;
      })
      .addCase(getAllThreads.rejected, (state, action) => {
        state.loadingThreads = false;
        state.threadsError = action.payload;
        console.log("Error fetching threads: ", action.payload);
      })
      .addCase(deleteThread.pending, (state) => {
        state.deletingThread = true;
        state.deleteError = null;
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.deletingThread = false;
        // Remove the deleted thread from all buckets
        const threadId = action.payload.threadId;
        (
          Object.keys(state.threads) as Array<keyof typeof state.threads>
        ).forEach((bucket) => {
          state.threads[bucket] = state.threads[bucket].filter(
            (thread: any) => thread.id !== threadId
          );
        });
      })
      .addCase(deleteThread.rejected, (state, action) => {
        state.deletingThread = false;
        state.deleteError = action.payload;
        console.log("Error deleting thread: ", action.payload);
      });
  },
});

export const { clearThreadsError } = threadSlice.actions;
export default threadSlice.reducer;
