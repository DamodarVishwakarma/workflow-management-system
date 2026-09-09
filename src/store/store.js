import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { flowboardApi } from '../services/flowboardApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [flowboardApi.reducerPath]: flowboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(flowboardApi.middleware),
});