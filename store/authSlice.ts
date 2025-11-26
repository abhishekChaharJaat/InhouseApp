import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  isSigningIn: false,
  isSigningUp: false,
  isVerifyingOtp: false,
  signInError: null as any,
  signUpError: null as any,
  otpError: null as any,
  pendingVerification: false,
  showAuthModal: {
    show: false,
    type: "signin",
  },
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
        return rejectWithValue(
          "Sign-in incomplete. Please check your credentials."
        );
      }
    } catch (err: any) {
      return rejectWithValue(
        err?.errors?.[0]?.message || "Failed to sign in. Please try again."
      );
    }
  }
);

export const signUpUser = createAsyncThunk(
  "auth/signUp",
  async (params: any, { rejectWithValue }) => {
    const { signUp, firstName, lastName, emailAddress, password } = params;
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      return { pendingVerification: true };
    } catch (err: any) {
      console.log("SignUp Error:", JSON.stringify(err, null, 2));
      return rejectWithValue(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          "Failed to sign up. Please try again."
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (params: any, { rejectWithValue }) => {
    const { signUp, setActive, code } = params;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        return { success: true };
      } else {
        return rejectWithValue("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      return rejectWithValue(
        err?.errors?.[0]?.message || "Invalid verification code."
      );
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
    clearOtpError: (state) => {
      state.otpError = null;
    },
    resetPendingVerification: (state) => {
      state.pendingVerification = false;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setShowAuthModal: (state, action) => {
      state.showAuthModal = {
        show: action.payload.show,
        type: action.payload.type,
      };
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
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.pendingVerification = action.payload.pendingVerification;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isSigningUp = false;
        state.signUpError = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isVerifyingOtp = true;
        state.otpError = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isVerifyingOtp = false;
        state.pendingVerification = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isVerifyingOtp = false;
        state.otpError = action.payload;
      });
  },
});

export const {
  clearSignInError,
  clearSignUpError,
  clearOtpError,
  resetPendingVerification,
  setToken,
  setShowAuthModal,
} = authSlice.actions;
export default authSlice.reducer;
