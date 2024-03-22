import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TooltipState {
    visible: boolean
    message: string
    position: {
        x: number
        y: number
    }
}

const initialState: TooltipState = {
    visible: false,
    message: '',
    position: { x: 0, y: 0 }
}

const tooltipSlice = createSlice({
    name: 'tooltip',
    initialState,
    reducers: {
        showTooltip(state, action: PayloadAction<{ message: string,  position: { x: number, y: number } }>) {
            state.visible = true
            state.message = action.payload.message
            state.position = action.payload.position
        },
        hideTooltip(state) {
            state.visible = false
            state.message = '' 
            state.position = { x: 0, y: 0 } 
        }
    }
})

export const { showTooltip, hideTooltip } = tooltipSlice.actions
export default tooltipSlice.reducer