import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "./homeSlice";
import authReducer from "./authSlice";
import messageReducer from "./messageSlice";

export const store = configureStore({
  reducer: {
    home: homeReducer,
    auth: authReducer,
    message: messageReducer,
  },
});
