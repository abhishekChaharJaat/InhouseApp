import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showSidenav: false,
  showContactHelp: false,
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
    setShowSinglePlanModal: (state, action) => {
      state.singlePlanModal = action.payload;
    },
    setReferralDrawerDetails: (state, action) => {
      state.referralDrawerDetails = action.payload;
    },
  },
});

export const {
  setShowSidenav,
  setShowContactHelp,
  setShowSinglePlanModal,
  setReferralDrawerDetails,
} = homeSlice.actions;
export default homeSlice.reducer;
