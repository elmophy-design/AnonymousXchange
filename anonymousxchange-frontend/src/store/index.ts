import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import chatReducer from './slices/chatSlice'
import ratesReducer from './slices/ratesSlice'
import transactionsReducer from './slices/transactionsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    rates: ratesReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
