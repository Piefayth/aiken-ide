import { configureStore } from '@reduxjs/toolkit'
import projectReducer from '../features/aiken/projectSlice'
import fileReducer from '../features/files/filesSlice'
import tooltipReducer from '../features/tooltip/tooltipSlice'
import contextMenuReducer from '../features/contextMenu/contextMenuSlice'
import managementReducer from '../features/management/managementSlice'

export const store = configureStore({
  reducer: {
    project: projectReducer,
    files: fileReducer,
    tooltip: tooltipReducer,
    contextMenu: contextMenuReducer,
    management: managementReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch