// store/homeSlice.ts
import { getToken } from "@/app/utils/helpers";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_ENDPOINT = "https://api-dev.inhouse.app";

// Async thunk to get checkout URL from Chargebee
export const getCheckoutUrl = createAsyncThunk(
  "home/getCheckoutUrl",
  async (
    data: {
      payment_type: string;
      subscription_info: {
        subscription_type: string;
        payment_frequency: string;
      };
      legal_review_thread_id?: string | null;
      redirect_url?: string;
    },
    { rejectWithValue }
  ) => {
    const token = await getToken();

    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/user/get-checkout-url`;
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to get checkout URL";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Async thunk to check payment status
export const getPaymentStatus = createAsyncThunk(
  "home/getPaymentStatus",
  async (paymentId: string, { rejectWithValue }) => {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/user/check-payment-status/${paymentId}`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to check payment status";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Async thunk for $99 consultation checkout (ad-hoc payment)
export const getConsultationCheckoutUrl = createAsyncThunk(
  "home/getConsultationCheckoutUrl",
  async (
    data: {
      legal_review_thread_id?: string | null;
      redirect_url?: string;
    },
    { rejectWithValue }
  ) => {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/user/get-checkout-url`;
      const headers = { Authorization: `Bearer ${token}` };

      const checkoutData = {
        payment_type: "transaction",
        legal_review_thread_id: data.legal_review_thread_id,
        redirect_url:
          data.redirect_url || "https://app.inhouse.app/payment-success",
      };

      const response = await axios.post(url, checkoutData, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to get checkout URL";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Async thunk to store referral lead
export const storeReferral = createAsyncThunk(
  "home/storeReferral",
  async (
    data: {
      name: string;
      email: string;
      phone?: string;
      thread_id: string | null;
      description?: string;
      state?: string;
      category?: string;
      type: "consultation" | "document_finalization";
    },
    { rejectWithValue }
  ) => {
    const token = await getToken();
    console.log("LEad ", data);
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/store-referral-lead`;
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        thread_id: data.thread_id,
        description: data.description || "",
        state: data.state || null,
        category: data.category || null,
        type: data.type,
      };

      const response = await axios.post(url, payload, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to store referral";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// Async thunk for Pro to Counsel upgrade
export const upgradeProUserToCounsel = createAsyncThunk(
  "home/upgradeProUserToCounsel",
  async (
    data: {
      payment_type: string;
      subscription_info: {
        subscription_type: string;
        payment_frequency: string;
      };
      legal_review_thread_id?: string | null;
    },
    { rejectWithValue }
  ) => {
    const token = await getToken();
    try {
      if (!token) {
        throw new Error("Authentication token not available");
      }
      const url = `${BASE_ENDPOINT}/api/user/update-subscription`;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to upgrade subscription";
      return rejectWithValue({ error: errorMessage });
    }
  }
);

const initialState = {
  showSidenav: false,
  showContactHelp: false,
  showNotSupportedModal: false,
  showMultiPlanModal: false,
  isWSConnected: false,
  singlePlanModal: {
    show: false,
    planType: "",
    threadId: null as string | null,
  },
  referralDrawerDetails: {
    show: false,
    threadId: null as string | null,
    drawerType: "",
    btnText: "",
  },
  viewDocInModal: {
    show: false as boolean,
    googleDocId: "" as string,
    threadId: "" as string,
  },
  // Payment state
  openChargebeePaymentModal: false,
  checkoutUrl: null as { url: string; payment_id: string } | null,
  checkoutUrlStatus: "idle" as "idle" | "loading" | "success" | string,
  paymentStatus: "" as "" | "successful" | "failed" | "pending",
  paymentStatusFetchStatus: "idle" as "idle" | "loading" | "success" | "failed",
  selectedPaymentPlanName: null as string | null,
  showPaymentStatusCheckModal: false,
  upgradeProUserToCounselStatus: "idle" as
    | "idle"
    | "loading"
    | "success"
    | "failed",
  // Referral state
  storeReferralStatus: "idle" as "idle" | "loading" | "success" | "failed",
  storeReferralError: null as string | null,
  referralFormData: null as {
    name: string;
    email: string;
    phone?: string;
    description?: string;
    thread_id: string;
    state?: string;
  } | null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setShowSidenav: (state, action) => {
      state.showSidenav = action.payload;
    },
    setShowContactHelp: (state, action) => {
      state.showContactHelp = action.payload;
    },
    setShowMultiPlanModal: (state, action) => {
      state.showMultiPlanModal = action.payload;
    },
    setWSConnected: (state, action) => {
      state.isWSConnected = action.payload;
    },
    setShowSinglePlanModal: (state, action) => {
      state.singlePlanModal = action.payload;
    },
    setReferralDrawerDetails: (state, action) => {
      state.referralDrawerDetails = action.payload;
    },
    setShowNotSupportedModal: (state, action) => {
      state.showNotSupportedModal = action.payload;
    },
    // Payment reducers
    setOpenChargebeePaymentModal: (state, action) => {
      state.openChargebeePaymentModal = action.payload;
    },
    setSelectedPaymentPlanName: (state, action) => {
      state.selectedPaymentPlanName = action.payload;
    },
    setShowPaymentStatusCheckModal: (state, action) => {
      state.showPaymentStatusCheckModal = action.payload;
    },
    resetPaymentStatus: (state) => {
      state.checkoutUrlStatus = "idle";
      state.paymentStatus = "";
      state.checkoutUrl = null;
      state.paymentStatusFetchStatus = "idle";
    },
    closeChargebeePaymentModal: (state) => {
      state.openChargebeePaymentModal = false;
    },
    // Referral reducers
    setReferralFormData: (state, action) => {
      state.referralFormData = action.payload;
    },
    resetStoreReferralStatus: (state) => {
      state.storeReferralStatus = "idle";
      state.storeReferralError = null;
    },
    setViewDocInModal: (state, action) => {
      state.viewDocInModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // getCheckoutUrl handlers
      .addCase(getCheckoutUrl.pending, (state) => {
        state.checkoutUrlStatus = "loading";
      })
      .addCase(getCheckoutUrl.fulfilled, (state, action) => {
        state.checkoutUrl = action.payload;
        state.checkoutUrlStatus = "success";
        state.openChargebeePaymentModal = true;
      })
      .addCase(getCheckoutUrl.rejected, (state, action: any) => {
        let message = "Failed to get checkout url";
        if (action.payload?.error) {
          const errorMsg = String(action.payload.error);
          message = errorMsg;
          if (errorMsg.toLowerCase().includes("user is already")) {
            message = "You are already subscribed to this plan";
          }
        }
        state.checkoutUrl = null;
        state.checkoutUrlStatus = message;
      })
      // getPaymentStatus handlers
      .addCase(getPaymentStatus.pending, (state) => {
        state.paymentStatusFetchStatus = "loading";
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.paymentStatus = action.payload?.status || "";
        state.paymentStatusFetchStatus = "success";
      })
      .addCase(getPaymentStatus.rejected, (state) => {
        state.paymentStatusFetchStatus = "failed";
      })
      // upgradeProUserToCounsel handlers
      .addCase(upgradeProUserToCounsel.pending, (state) => {
        state.upgradeProUserToCounselStatus = "loading";
      })
      .addCase(upgradeProUserToCounsel.fulfilled, (state) => {
        state.upgradeProUserToCounselStatus = "success";
      })
      .addCase(upgradeProUserToCounsel.rejected, (state) => {
        state.upgradeProUserToCounselStatus = "failed";
      })
      // getConsultationCheckoutUrl handlers (reuses same state as getCheckoutUrl)
      .addCase(getConsultationCheckoutUrl.pending, (state) => {
        state.checkoutUrlStatus = "loading";
      })
      .addCase(getConsultationCheckoutUrl.fulfilled, (state, action) => {
        state.checkoutUrl = action.payload;
        state.checkoutUrlStatus = "success";
        state.openChargebeePaymentModal = true;
      })
      .addCase(getConsultationCheckoutUrl.rejected, (state, action: any) => {
        let message = "Failed to get checkout url";
        if (action.payload?.error) {
          message = String(action.payload.error);
        }
        state.checkoutUrl = null;
        state.checkoutUrlStatus = message;
      })
      // storeReferral handlers
      .addCase(storeReferral.pending, (state) => {
        state.storeReferralStatus = "loading";
        state.storeReferralError = null;
      })
      .addCase(storeReferral.fulfilled, (state) => {
        state.storeReferralStatus = "success";
        state.storeReferralError = null;
      })
      .addCase(storeReferral.rejected, (state, action: any) => {
        state.storeReferralStatus = "failed";
        state.storeReferralError =
          action.payload?.error || "Failed to store referral";
      });
  },
});

export const {
  setShowSidenav,
  setShowContactHelp,
  setShowSinglePlanModal,
  setReferralDrawerDetails,
  setWSConnected,
  setShowNotSupportedModal,
  setShowMultiPlanModal,
  // Payment actions
  setOpenChargebeePaymentModal,
  setSelectedPaymentPlanName,
  setShowPaymentStatusCheckModal,
  resetPaymentStatus,
  closeChargebeePaymentModal,
  // Referral actions
  setReferralFormData,
  resetStoreReferralStatus,
  setViewDocInModal,
} = homeSlice.actions;

export default homeSlice.reducer;
