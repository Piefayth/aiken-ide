import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type DeleteFileOption = {
    deletedFileIndex: number
}

type RenameFileOption = {
    renamedFileIndex: number
}

type ContextMenuChoice = {
    name: 'New File'
} | {
    name: 'Delete File'
    data: DeleteFileOption
} | {
    name: 'Rename File',
    data: RenameFileOption
};


interface ContextMenuState {
    visible: boolean
    options: ContextMenuChoice[],
    position: {
        x: number
        y: number
    }
}

const initialState: ContextMenuState = {
    visible: false,
    options: [],
    position: {
        x: 0,
        y: 0
    }
}

const contextMenuSlice = createSlice({
    name: 'contextMenu',
    initialState,
    reducers: {
        showContextMenu(state, action: PayloadAction<{options: ContextMenuChoice[], position: {x: number, y: number}}>) {
            state.visible = true
            state.options = action.payload.options
            state.position = action.payload.position
        },
        hideContextMenu(state) {
            state.visible = false
            state.options = []
            state.position = { x: 0, y: 0}
        }
    }
})

export const { showContextMenu, hideContextMenu } = contextMenuSlice.actions 
export default contextMenuSlice.reducer