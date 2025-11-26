import { getToken } from "@/app/helpers";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_ENDPOINT = "https://api-dev.inhouse.app";

const initialState = {
  userMetadata: null as any,
  loading: false,
  error: null as any,
  lawyerHubData: null as any,
  lawyerHubLoading: false,
  lawyerHubError: null as any,
};

export const getUserMetadata = createAsyncThunk(
  "onboarding/getUserMetadata",
  async ({ threadId }: { threadId?: any }, { rejectWithValue }) => {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }

      let url = `${BASE_ENDPOINT}/api/user/get-metadata`;
      // Add threadId as query parameter if provided
      // if (threadId && threadId !== "null") {
      //   url += `?anonymous_thread_id=${threadId}`;
      // }

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

export const getLawyerHub = createAsyncThunk(
  "onboarding/getLawyerHub",
  async (_, { rejectWithValue }) => {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${BASE_ENDPOINT}/api/user/get-lawyer-hub-data`,
        { headers }
      );

      return response.data;
    } catch (error: any) {
      const status = error.response?.status || null;
      // User not found in backend (new user) - return empty data instead of error
      if (status === 404 || error.response?.data?.error === "UserNotFoundException") {
        return [];
      }
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch lawyer hub data";
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
      })
      .addCase(getLawyerHub.pending, (state) => {
        state.lawyerHubLoading = true;
        state.lawyerHubError = null;
      })
      .addCase(getLawyerHub.fulfilled, (state, action) => {
        state.lawyerHubLoading = false;
        state.lawyerHubData = action.payload;
      })
      .addCase(getLawyerHub.rejected, (state, action) => {
        state.lawyerHubLoading = false;
        state.lawyerHubError = action.payload;
        console.log("Error fetching lawyer hub data:", action.payload);
      });
  },
});

export const { clearError, clearUserMetadata } = onboardingSlice.actions;
export default onboardingSlice.reducer;

const data = [
  {
    ai_document_unlocked: false,
    consultation_requested: false,
    finalization_requested: true,
    thread_id: "39ca2541-da76-474b-b56c-588766d35648",
  },
  {
    ai_document_unlocked: false,
    consultation_requested: false,
    finalization_requested: true,
    thread_id: "51601471-bb2b-438d-9117-a4dcf9ed0075",
  },
  {
    ai_document_unlocked: false,
    consultation_requested: false,
    finalization_requested: true,
    thread_id: "7fa2e57b-881b-460f-99b2-025ad732eb5c",
  },
  {
    ai_document_unlocked: false,
    consultation_requested: false,
    finalization_requested: true,
    thread_id: "8559c4cb-c30b-43b9-a857-c63e04cc33fd",
  },
  {
    ai_document_unlocked: false,
    consultation_requested: false,
    finalization_requested: true,
    thread_id: "be101379-f42c-4798-9e17-485156c363ea",
  },
];
