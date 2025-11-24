// store/homeSlice.js (or where your slice is)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showSidenav: false,
  showContactHelp: false,
  showNotSupportedModal: false,
  showMultiPlanModal: false,
  isWSConnected: false, // <-- NEW
  singlePlanModal: {
    show: false,
    planType: "",
    threadId: null,
  },
  referralDrawerDetails: {
    show: false,
    threadId: null,
    drawerType: "",
    btnText: "",
  },
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
    // NEW REDUCER
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
  },
});

export const {
  setShowSidenav,
  setShowContactHelp,
  setShowSinglePlanModal,
  setReferralDrawerDetails,
  setWSConnected, // <-- EXPORT NEW ACTION
  setShowNotSupportedModal,
  setShowMultiPlanModal,
} = homeSlice.actions;

export default homeSlice.reducer;
