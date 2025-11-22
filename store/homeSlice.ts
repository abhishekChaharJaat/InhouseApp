import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showSidenav: false,
  showContactHelp: false,
  singlePlanModal: {
    show: false,
    planType: "",
    threadId: null,
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
  },
});

export const { setShowSidenav, setShowContactHelp, setShowSinglePlanModal } =
  homeSlice.actions;
export default homeSlice.reducer;
