import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  status: "idle" | "hydrating" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setHydrating(state) {
      state.status = "hydrating";
    },
    setAuthenticated(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    setUnauthenticated(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setHydrating, setAuthenticated, setUnauthenticated, updateUser } = authSlice.actions;
export default authSlice.reducer;
