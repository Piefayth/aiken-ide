import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UtxoSource } from '../../panels/management/transact/UtxoSelector'
import { SerializableAssets, SerializableUTxO } from '../../util/utxo'

type SerializedDate = string

export type ValidityInterval = {
    from: SerializedDate,
    to: SerializedDate
}

export type Spend = {
    source: UtxoSource,
    redeemerFileName: string,
    utxos: SerializableUTxO[]
}

export type Mint = {
    policyId: string,
    assets: SerializableAssets
    redeemerFileName: string
}

export type Payment = {
    toAddress: string,
    datumFileName: string, // assuming inline datum atm
    assets: SerializableAssets
}

export type TransactState = {
    addSpendError: string | undefined
} & Transaction

export type Transaction = {
    spends: Spend[]
    mints: Mint[]
    payments: Payment[]
    extraSigners: string[]
    validity: ValidityInterval
    metadataFilename: string
    transactionHistory: Transaction[]
}

const initialState: TransactState = {
    addSpendError: undefined,
    spends: [],
    mints: [],
    payments: [],
    extraSigners: [],
    validity: {
        from: '',
        to: ''
    },
    metadataFilename: 'None',
    transactionHistory: []
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
        setExtraSigners(state, action: PayloadAction<string[]>) {
            state.extraSigners = action.payload
        },
        setValidityInterval(state, action: PayloadAction<ValidityInterval>) {
            state.validity = action.payload
        },
        setMetadata(state, action: PayloadAction<string>) {
            state.metadataFilename = action.payload
        },
        setAddSpendError(state, action: PayloadAction<string>) {
            state.addSpendError = action.payload
        },
        onTransactionSubmission(state, action: PayloadAction<Transaction>) {
            state.transactionHistory.push(action.payload)
            state.mints = []
            state.spends = []
            state.payments = []
            state.extraSigners = []
            state.validity.from = ''
            state.validity.to = ''
            state.metadataFilename = 'None'
        },
        clearAddSpendError(state) {
            state.addSpendError = undefined
        },
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
    removePayment,
    setExtraSigners,
    setValidityInterval,
    setMetadata,
    onTransactionSubmission
} = transactSlice.actions
export default transactSlice.reducer