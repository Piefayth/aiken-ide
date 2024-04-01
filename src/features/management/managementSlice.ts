import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Lucid, Network, Script, WalletApi } from 'lucid-cardano'
export const TAB_NAMES = ['Build', 'Contracts', 'Wallets', 'Transact']

export interface Wallet {
    address: string,
    pkh: string,
    seed: string | null,
    isCurrentlyConnected: boolean
    walletVendor: string | null
}

export interface ContractInput {
    script: Script,
    name: string,
    paramsFileName: string,
    address: string,
    scriptHash: string
}

export interface DeleteContractInput {
    name: string
    version: number
}

export type Contract = {
    version: number,
} & ContractInput

interface ManagementState {
    selectedTabIndex: number
    wallets: Wallet[]
    contracts: Contract[],
    addContractError: string | undefined
}

const initialState: ManagementState = {
    selectedTabIndex: 0,
    wallets: [],
    contracts: [],
    addContractError: undefined,
}

type AccountChangeParams = {
    lucid: Lucid,
    wallet: WalletApi
}

const managementSlice = createSlice({
    name: 'management',
    initialState,
    reducers: {
        selectTab(state, action: PayloadAction<number>) {
            state.selectedTabIndex = action.payload
        },
        addWallet(state, action: PayloadAction<Wallet>) {
            if (!state.wallets.find(wallet => wallet.pkh === action.payload.pkh)) {
                if (action.payload.isCurrentlyConnected) {
                    for (let i = 0; i < state.wallets.length; i++) {
                        state.wallets[i].isCurrentlyConnected = false
                    }
                }

                state.wallets.push(action.payload)
            }
        },
        removeWallet(state, action: PayloadAction<string>) {
            state.wallets.filter(wallet => wallet.address === action.payload)
        },
        setConnectedWallet(state, action: PayloadAction<string>) {
            for (let i = 0; i < state.wallets.length; i++) {
                if (state.wallets[i].pkh === action.payload) {
                    state.wallets[i].isCurrentlyConnected = true
                } else {
                    console.error(`Could not connect to wallet with pkh ${action.payload}`)
                }
            }
        },
        clearWallets(state) {
            state.wallets = []
        },
        addContract(state, action: PayloadAction<ContractInput>) {
            let version = 0
            for (let contract of state.contracts) {
                const hasSameName = contract.name === action.payload.name 
                const hasSameProgram = contract.script.script === action.payload.script.script
                if (hasSameName && hasSameProgram) {
                    const errorMessage = `Contract already exists as ${contract.name} v${contract.version}.`
                    state.addContractError = errorMessage
                    return
                }

                if (contract.name === action.payload.name && contract.version >= version) {
                    version = contract.version + 1
                }
            }

            state.contracts.unshift({
                ...action.payload,
                version
            })
        },
        removeContract(state, action: PayloadAction<DeleteContractInput>) {
            const { name, version } = action.payload
            state.contracts = state.contracts.filter(contract => !(contract.name === name && contract.version === version))
        },
        clearAddContractError(state) {
            state.addContractError = undefined
        },
        setAddContractError(state, action: PayloadAction<string>) {
            state.addContractError = action.payload
        },
    }
})

export const { 
    selectTab,
    addWallet,
    removeWallet,
    setConnectedWallet,
    clearWallets,
    addContract,
    removeContract,
    clearAddContractError,
    setAddContractError,
} = managementSlice.actions
export default managementSlice.reducer