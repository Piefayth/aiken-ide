import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { CURSED_ZERO_WIDTH_SPACE } from '../../constants'

const SOME_AIKEN_CODE = `use aiken/list
use aiken/transaction.{
  ScriptContext
}

type CoolTokenRedeemer {
  guessed_word: ByteArray
}

type FancyType {
  code_word: ByteArray
}

validator(fancy: FancyType) {
  fn mint_my_cool_token(redeemer: CoolTokenRedeemer, _ctx: ScriptContext) -> Bool {
      redeemer.guessed_word == fancy.code_word
  }
}

fn quicksort(xs: List<Int>) -> List<Int> {
  when xs is {
    [] ->
      []
    [p, ..tail] -> {
      let before = tail |> list.filter(fn(x) { x < p }) |> quicksort
      let after = tail |> list.filter(fn(x) { x >= p }) |> quicksort
      list.concat(before, [p, ..after])
    }
  }
}

test quicksort_0() {
  quicksort([]) == []
}

test quicksort_1() {
  quicksort([3, 2, 1, 4]) == [1, 2, 3, 4]
}

test quicksort_2() {
  quicksort([1, 2, 3, 4]) == [1, 2, 3, 4]
}
`

export interface File {
    name: string,
    content: string,
    type: 'aiken' | 'json' | 'text'
}

/*
  files: Array of file metadata and content indexed in file tree order.
  currentFileFocusedInEditorIndex: The index in the files array containing the currently loaded model.
  openFileIndices: The currently open files, indexed in tab order.
  pendingCloseFileIndex: The index of a tab that has experienced a mouseDown interaction with intent to close but not yet a mouseUp
*/
export interface FileState {
    files: File[],
    currentFileFocusedInEditorIndex: number,
    openFileIndices: number[],
    pendingCloseFileIndex: number,
    beingRenamedFileIndex: number,
    renameFileError: string | null,
}

const initialState: FileState = {
    files: [{
        name: 'example.ak',
        content: SOME_AIKEN_CODE,   // when do we update content??
        type: 'aiken'
    }, {
        name: 'example2.ak',
        content: SOME_AIKEN_CODE,
        type: 'aiken'
    }, {
        name: 'example3.ak',
        content: SOME_AIKEN_CODE,
        type: 'aiken'
    }],
    currentFileFocusedInEditorIndex: 0,
    openFileIndices: [0],
    pendingCloseFileIndex: -1,
    beingRenamedFileIndex: -1,
    renameFileError: null,
}

export const filesSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        selectFile(state, action: PayloadAction<number>) {
            state.currentFileFocusedInEditorIndex = action.payload
            if (!state.openFileIndices.includes(action.payload)) {
                state.openFileIndices.push(action.payload)
            }
        },
        closeFile(state, action: PayloadAction<number>) {
            const closedFileIndex = action.payload

            if (closedFileIndex != state.pendingCloseFileIndex) {
                state.pendingCloseFileIndex = -1;
                return // if this isn't the tab we initially mouse-downed on, don't close it on mouse up
            }

            if (closedFileIndex == state.beingRenamedFileIndex) {
              state.pendingCloseFileIndex = -1;
              return // no closing a file while you're renaming it
            }

            const closedFileIndexInOpenFilesArray = state.openFileIndices.indexOf(closedFileIndex)
            const newFocusedFileIndexInOpenFilesArray = closedFileIndexInOpenFilesArray > 0 ? closedFileIndexInOpenFilesArray - 1 : closedFileIndexInOpenFilesArray + 1
            const newFocusedFile = state.openFileIndices[newFocusedFileIndexInOpenFilesArray]

            state.openFileIndices.splice(closedFileIndexInOpenFilesArray, 1)

            if (state.currentFileFocusedInEditorIndex != closedFileIndex) {
                return // no need to change the focused file if we aren't focusing the closed file
            }

            state.currentFileFocusedInEditorIndex = newFocusedFile
        },
        pendingCloseFile(state, action: PayloadAction<number>) {
            state.pendingCloseFileIndex = action.payload
        },
        addFile(state) {
            if (state.beingRenamedFileIndex !== -1) {
              // you can't add a new file while you're renaming one
              return
            }

            let uniqueFilename = 'newfile'

            for (let i = 1; i < Infinity; i++) {
              const potentialUniqueFilename = `${uniqueFilename}${i === 1 ? '' : i - 1}.ext`
              if (!state.files.find(file => file.name === potentialUniqueFilename)){
                uniqueFilename = potentialUniqueFilename
                break
              }
            }

            state.files.push({
              name: uniqueFilename,
              content: '',
              type: 'text'
            })

            const newFileIndex = state.files.length - 1
            state.beingRenamedFileIndex = newFileIndex
            state.currentFileFocusedInEditorIndex = newFileIndex
            if (!state.openFileIndices.includes(newFileIndex)) {
              state.openFileIndices.push(newFileIndex)
          }
        },
        renameFile(state, action: PayloadAction<number>) {
          state.beingRenamedFileIndex = action.payload
        },
        confirmRenameFile(state, action: PayloadAction<string>) {
          const newFilename = action.payload
          const isFilenameUnique = !state.files.find((file, index) => file.name === newFilename && index != state.beingRenamedFileIndex)
          const isFileExtensionValid = true

          let errorText = ""

          if (!isFilenameUnique) {
            errorText = "Filenames must be unique."
          } else if (!isFileExtensionValid) {
            errorText = "Allowed extensions: .ak .json .js .ts .txt."
          } else {
            state.files[state.beingRenamedFileIndex].name = newFilename
            state.beingRenamedFileIndex = -1
            state.renameFileError = null
          } 

          if (state.renameFileError === errorText && state.renameFileError !== null) {
            // If the new error is the same as last time, change it
            // imperceptibly to force a rerender. Sorry.
            state.renameFileError += CURSED_ZERO_WIDTH_SPACE
          } else {
            state.renameFileError = errorText
          }
        },
        cancelRenameFile(state) {
          state.beingRenamedFileIndex = -1
          state.renameFileError = null
        }
    }
})

export const { selectFile, closeFile, pendingCloseFile, addFile, confirmRenameFile, cancelRenameFile } = filesSlice.actions
export default filesSlice.reducer