import { configureStore } from '@reduxjs/toolkit'
import projectReducer from '../features/aiken/projectSlice'
import fileReducer from '../features/files/filesSlice'
import tooltipReducer from '../features/tooltip/tooltipSlice'
import contextMenuReducer from '../features/contextMenu/contextMenuSlice'
import managementReducer from '../features/management/managementSlice'
import lucidReducer from '../features/management/lucidSlice'
import transactReducer from '../features/management/transactSlice'
import settingsReducer from '../features/settings/settingsSlice'

export const store = configureStore({
  reducer: {
    project: projectReducer,
    files: fileReducer,
    tooltip: tooltipReducer,
    contextMenu: contextMenuReducer,
    management: managementReducer,
    lucid: lucidReducer,
    transact: transactReducer,
    settings: settingsReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch