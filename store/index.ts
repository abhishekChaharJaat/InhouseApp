import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "./homeSlice";
import authReducer from "./authSlice";
import messageReducer from "./messageSlice";
import onboardingReducer from "./onboardingSlice";
import threadReducer from "./threadSlice";

export const store = configureStore({
  reducer: {
    home: homeReducer,
    auth: authReducer,
    message: messageReducer,
    onboarding: onboardingReducer,
    thread: threadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
