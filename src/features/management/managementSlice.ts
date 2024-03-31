import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Network, Script } from 'lucid-cardano'
export const TAB_NAMES = ['Build', 'Contracts', 'Wallets', 'Transact']

export interface Wallet {
    address: string,
    seed: string
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

const managementSlice = createSlice({
    name: 'management',
    initialState,
    reducers: {
        selectTab(state, action: PayloadAction<number>) {
            state.selectedTabIndex = action.payload
        },
        addWallet(state, action: PayloadAction<Wallet>) {
            if (!state.wallets.find(wallet => wallet.address === action.payload.address)) {
                state.wallets.push(action.payload)
            }
        },
        removeWallet(state, action: PayloadAction<string>) {
            state.wallets.filter(wallet => wallet.address === action.payload)
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
    clearWallets,
    addContract,
    removeContract,
    clearAddContractError,
    setAddContractError,
} = managementSlice.actions
export default managementSlice.reducer