import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showSidenav: false,
  showContactHelp: false,
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
  },
});

export const { setShowSidenav, setShowContactHelp } = homeSlice.actions;
export default homeSlice.reducer;
