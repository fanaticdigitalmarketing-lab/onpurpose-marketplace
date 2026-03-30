import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import hostsSlice from './slices/hostsSlice';
import bookingsSlice from './slices/bookingsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    hosts: hostsSlice,
    bookings: bookingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
