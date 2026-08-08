import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Rate {
  asset: string
  type: 'crypto' | 'giftcard'
  buyRate?: number
  sellRate?: number
  currency: string
  updatedAt: string
}

interface RatesState {
  items: Rate[]
  loading: boolean
  lastUpdated: string | null
}

const initialState: RatesState = {
  items: [],
  loading: false,
  lastUpdated: null,
}

const ratesSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    setRates: (state, action: PayloadAction<Rate[]>) => {
      state.items = action.payload
      state.lastUpdated = new Date().toISOString()
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setRates, setLoading } = ratesSlice.actions
export default ratesSlice.reducer
