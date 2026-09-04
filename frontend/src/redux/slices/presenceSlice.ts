import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PresenceState {
  onlineIds: string[];
}

const initialState: PresenceState = {
  onlineIds: [],
};

const presenceSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    setUserOnline(state, action: PayloadAction<string>) {
      if (!state.onlineIds.includes(action.payload)) {
        state.onlineIds.push(action.payload);
      }
    },
    setUserOffline(state, action: PayloadAction<string>) {
      state.onlineIds = state.onlineIds.filter((id) => id !== action.payload);
    },
    resetPresence(state) {
      state.onlineIds = [];
    },
  },
});

export const { setUserOnline, setUserOffline, resetPresence } = presenceSlice.actions;
export default presenceSlice.reducer;
