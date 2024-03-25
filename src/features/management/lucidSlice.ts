import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Network } from 'lucid-cardano'


export interface LucidState {
    network: Network | "Emulator"
    isLoading: boolean
}

const initialState: LucidState = {
    network: "Emulator",
    isLoading: true
}

const lucidSlice = createSlice({
    name: 'lucid',
    initialState,
    reducers: {
        setNetwork(state, action:PayloadAction<Network | "Emulator">) {
            state.network = action.payload
        },
        setIsLucidLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        }
    }
})

export const { 
    setNetwork,
    setIsLucidLoading,
} = lucidSlice.actions
export default lucidSlice.reducer