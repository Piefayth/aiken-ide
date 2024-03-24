import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Network, Script } from 'lucid-cardano'
export const TAB_NAMES = ['Build', 'Contracts', 'Wallets', 'Transact']

export interface Wallet {
    address: string,
    seed: string
}

interface ManagementState {
    selectedTabIndex: number
    network: Network | "Emulator"
    wallets: Wallet[]
    contracts: Script[]
}

const initialState: ManagementState = {
    selectedTabIndex: 0,
    network: "Emulator",
    wallets: [],
    contracts: []
}

const managementSlice = createSlice({
    name: 'management',
    initialState,
    reducers: {
        selectTab(state, action: PayloadAction<number>) {
            state.selectedTabIndex = action.payload
        },
        setNetwork(state, action:PayloadAction<Network | "Emulator">) {
            state.network = action.payload
        },
        addWallet(state, action: PayloadAction<Wallet>) {
            state.wallets.push(action.payload)
        },
        addContract(state, action: PayloadAction<Script>) {
            state.contracts.push(action.payload)
        }
    }
})

export const { 
    selectTab,
    setNetwork,
    addWallet,
} = managementSlice.actions
export default managementSlice.reducer