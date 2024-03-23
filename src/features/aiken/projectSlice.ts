import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { BuildResult } from '../../hooks/useAiken'
import { findLineNumberByCharIndex } from '../../util/strings'
import { File } from '../files/filesSlice'

export interface ProjectState {
    buildResults: BuildResult[] | null
    builtFiles: File[]
}

const initialState: ProjectState = {
    buildResults: [],
    builtFiles: []
}

export const projectSlice = createSlice({
    name: 'aiken',
    initialState,
    reducers: {
        testProject: (state, action: PayloadAction<{compiledFiles: File[], buildResults: BuildResult[]}>) => {
            state.buildResults = action.payload.buildResults
            state.builtFiles = action.payload.compiledFiles

            for (let i = 0; i < state.buildResults.length; i++) {
                state.buildResults[i].errors = state.buildResults[i].errors.map((err) => {
                    const line = findLineNumberByCharIndex(state.builtFiles[i].content, err.line) || -1
                    return {
                        ...err,
                        line
                    }
                })
    
                state.buildResults[i].warnings = state.buildResults[i].warnings.map((err) => {
                    const line = findLineNumberByCharIndex(state.builtFiles[i].content, err.line) || -1
                    return {
                        ...err,
                        line
                    }
                })
            }


        },
    }
})

export const { testProject } = projectSlice.actions
export default projectSlice.reducer