import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Transaction {
  id: string
  type: string
  asset: string
  amount?: number
  status: string
  createdAt: string
}

interface TransactionsState {
  items: Transaction[]
  loading: boolean
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setTransactions, setLoading } = transactionsSlice.actions
export default transactionsSlice.reducer
