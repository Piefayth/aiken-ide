import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UtxoSource } from '../../panels/management/transact/UtxoSelector'
import { SerializableAssets, SerializableUTxO } from '../../util/utxo'

export type Spend = {
    source: UtxoSource,
    redeemerFileName: string,
    utxos: SerializableUTxO[]
}

export type Mint = {
    policyId: string,
    assetName: string,
    amount: number // string? technically should be a bigint, but thats illegal in redux
}

export type Payment = {
    toAddress: string,
    datumFileName: string, // assuming inline datum atm
    assets: SerializableAssets
}

interface TransactState {
    addSpendError: string | undefined
    spends: Spend[]
    mints: Mint[]
    payments: Payment[]
}

const initialState: TransactState = {
    addSpendError: undefined,
    spends: [],
    mints: [],
    payments: []
}



const transactSlice = createSlice({
    name: 'transact',
    initialState,
    reducers: {
        addSpend(state, action: PayloadAction<Spend>) {
            state.spends = [...state.spends, action.payload]
        },
        removeSpend(state, action: PayloadAction<number>) {
            state.spends.splice(action.payload, 1)
        },
        addMint(state, action: PayloadAction<Mint>) {
            state.mints = [...state.mints, action.payload]
        },
        removeMint(state, action: PayloadAction<number>) {
            state.mints.splice(action.payload, 1)
        },
        addPayment(state, action: PayloadAction<Payment>) {
            state.payments = [...state.payments, action.payload]
        },
        removePayment(state, action: PayloadAction<number>) {
            state.payments.splice(action.payload, 1)
        },
        setAddSpendError(state, action: PayloadAction<string>) {
            state.addSpendError = action.payload
        },
        clearAddSpendError(state) {
            state.addSpendError = undefined
        }
    }
})

export const {
    setAddSpendError,
    clearAddSpendError,
    addSpend,
    removeSpend,
    addMint,
    removeMint,
    addPayment,
    removePayment
} = transactSlice.actions
export default transactSlice.reducer