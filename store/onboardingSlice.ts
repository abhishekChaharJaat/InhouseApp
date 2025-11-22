import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_ENDPOINT = "https://api-dev.inhouse.app";

const initialState = {
  userMetadata: null as any,
  loading: false,
  error: null as any,
};

export const getUserMetadata = createAsyncThunk(
  "onboarding/getUserMetadata",
  async (
    { token, threadId }: { token: string; threadId?: string },
    { rejectWithValue }
  ) => {
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }

      let url = `${BASE_ENDPOINT}/api/user/get-metadata`;
      // Add threadId as query parameter if provided
      if (threadId && threadId !== "null") {
        url += `?anonymous_thread_id=${threadId}`;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch user metadata";
      const status = error.response?.status || null;
      return rejectWithValue({ error: errorMessage, status });
    }
  }
);

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserMetadata: (state) => {
      state.userMetadata = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserMetadata.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserMetadata.fulfilled, (state, action) => {
        state.loading = false;
        state.userMetadata = action.payload;
      })
      .addCase(getUserMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log("Error fetching user metadata:", action.payload);
      });
  },
});

export const { clearError, clearUserMetadata } = onboardingSlice.actions;
export default onboardingSlice.reducer;
