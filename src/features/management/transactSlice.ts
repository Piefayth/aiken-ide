import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Spend } from '../../panels/management/transact/Transact'

interface TransactState {
    addSpendError: string | undefined
    spends: Spend[]
}

const initialState: TransactState = {
    addSpendError: undefined,
    spends: []
}

const transactSlice = createSlice({
    name: 'transact',
    initialState,
    reducers: {
        addSpend(state, action: PayloadAction<Spend>) {
            state.spends = [...state.spends, action.payload]
        },
        removeSpend(state, action: PayloadAction<number>) {
            console.log(action.payload)
            state.spends.splice(action.payload, 1)
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
    removeSpend
} = transactSlice.actions
export default transactSlice.reducer