import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  isSigningIn: false,
  isSigningUp: false,
  signInError: null as any,
  signUpError: null as any,
};

export const signInUser = createAsyncThunk(
  "auth/signIn",
  async (params: any, { rejectWithValue }) => {
    const { signIn, setActive, emailAddress, password } = params;
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        return { success: true };
      } else {
        return rejectWithValue("Sign-in incomplete. Please check your credentials.");
      }
    } catch (err: any) {
      return rejectWithValue(err?.errors?.[0]?.message || "Failed to sign in. Please try again.");
    }
  }
);

export const signUpUser = createAsyncThunk(
  "auth/signUp",
  async (params: any, { rejectWithValue }) => {
    const { signUp, setActive, firstName, lastName, emailAddress, password } = params;
    try {
      const signUpAttempt = await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        return { success: true };
      } else {
        return rejectWithValue("Signup incomplete. Please check your details.");
      }
    } catch (err: any) {
      return rejectWithValue(err?.errors?.[0]?.message || "Failed to sign up. Please try again.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearSignInError: (state) => {
      state.signInError = null;
    },
    clearSignUpError: (state) => {
      state.signUpError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.pending, (state) => {
        state.isSigningIn = true;
        state.signInError = null;
      })
      .addCase(signInUser.fulfilled, (state) => {
        state.isSigningIn = false;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isSigningIn = false;
        state.signInError = action.payload;
      })
      .addCase(signUpUser.pending, (state) => {
        state.isSigningUp = true;
        state.signUpError = null;
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.isSigningUp = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isSigningUp = false;
        state.signUpError = action.payload;
      });
  },
});

export const { clearSignInError, clearSignUpError } = authSlice.actions;
export default authSlice.reducer;
