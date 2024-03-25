import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TooltipData {
    id: string;
    message: string;
    position: {
        x: number;
        y: number;
    };
}

interface TooltipState {
    tooltips: TooltipData[];
}

const initialState: TooltipState = {
    tooltips: []
};

const tooltipSlice = createSlice({
    name: 'tooltip',
    initialState,
    reducers: {
        showTooltip(state, action: PayloadAction<TooltipData>) {
            const { id, message, position } = action.payload;
            const existingTooltipIndex = state.tooltips.findIndex(tooltip => tooltip.id === id);
            if (existingTooltipIndex !== -1) {
                state.tooltips[existingTooltipIndex] = { id, message, position };
            } else {
                state.tooltips.push({ id, message, position });
            }
        },
        hideTooltip(state, action: PayloadAction<string>) {
            state.tooltips = state.tooltips.filter(tooltip => tooltip.id !== action.payload);
        }
    }
});

export const { showTooltip, hideTooltip } = tooltipSlice.actions;
export default tooltipSlice.reducer;