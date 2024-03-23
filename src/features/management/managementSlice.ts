import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const TAB_NAMES = ['Build', 'Contracts', 'Wallet', 'Transact']

interface ManagementState {
    selectedTabIndex: number
}

const initialState: ManagementState = {
    selectedTabIndex: 0
}

const managementSlice = createSlice({
    name: 'management',
    initialState,
    reducers: {
        selectTab(state, action: PayloadAction<number>) {
            state.selectedTabIndex = action.payload
        }
    }
})

export const { 
    selectTab
} = managementSlice.actions
export default managementSlice.reducer