import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { BuildResult } from '../../hooks/useAiken'
import { findLineNumberByCharIndex } from '../../util/strings'

export interface ProjectState {
    buildResult: BuildResult | null
    builtCode: string 
}

const initialState: ProjectState = {
    buildResult: null,
    builtCode: ""
}

export const projectSlice = createSlice({
    name: 'aiken',
    initialState,
    reducers: {
        testProject: (state, action: PayloadAction<{code: string, buildResult: BuildResult}>) => {
            state.buildResult = action.payload.buildResult
            state.builtCode = action.payload.code

            state.buildResult.errors = state.buildResult.errors.map((err) => {
                const line = findLineNumberByCharIndex(state.builtCode, err.line) || -1
                return {
                    ...err,
                    line
                }
            })

            state.buildResult.warnings = state.buildResult.warnings.map((err) => {
                const line = findLineNumberByCharIndex(state.builtCode, err.line) || -1
                return {
                    ...err,
                    line
                }
            })
        },
    }
})

export const { testProject } = projectSlice.actions
export default projectSlice.reducer