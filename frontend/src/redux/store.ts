import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api/baseApi";
import authReducer from "./slices/authSlice";
import presenceReducer from "./slices/presenceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    presence: presenceReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
