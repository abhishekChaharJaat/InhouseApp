import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showSidenav: false,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setShowSidenav: (state, action) => {
      state.showSidenav = action.payload;
    },
  },
});

export const { setShowSidenav } = homeSlice.actions;
export default homeSlice.reducer;
