import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { splitFilename } from "../../util/strings"
import { selectFile, addFile, confirmRenameFile, cancelRenameFile, clearRenameFileError } from "../../features/files/filesSlice"
import React, { useEffect, useRef } from "react";
import { showContextMenu } from "../../features/contextMenu/contextMenuSlice";
import { useTooltip } from "../../hooks/useTooltip";

function FileManager() {
    const files = useSelector((state: RootState) => state.files)
    const dispatch = useDispatch()

    const inputRef = useRef<HTMLInputElement>(null)

    // focus and select the name of any file being newly renamed
    useEffect(() => {
        if (files.beingRenamedFileIndex !== -1 && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [files.beingRenamedFileIndex])

    useTooltip(files.renameFileError || '', inputRef, { x: 100, y: -10 }, () => {
        dispatch(clearRenameFileError())
    })

    return (
        <div className='file-manager-container'>
            <div className='file-manager-header unselectable'>
                <div>
                    <strong>Files</strong>
                </div>
                <div
                    className='add-file-icon unselectable'
                    onClick={() => dispatch(addFile())}
                >
                    <span className='add-file-icon-plus'>+</span>🗎
                </div>

            </div>

            <div
                className='file-manager-file-list '
                onContextMenu={(e: React.MouseEvent) => {
                    e.preventDefault()
                    dispatch(showContextMenu({
                        options: [{ name: 'New File' }],
                        position: {
                            x: e.clientX,
                            y: e.clientY
                        }
                    }))
                }}
            >
                <div className='file-entry-wrapper'>
                    {
                        files.files.map((file, index) => {
                            const { name, extension } = splitFilename(file.name)
                            const highlightOpenFocusedFileClass = index === files.currentFileFocusedInEditorIndex ? 'highlight-open-focused-file' : ''
                            const highlightOpenFileClass = files.openFileIndices.includes(index) ? 'highlight-open-file' : ''

                            if (index === files.beingRenamedFileIndex) {
                                return (
                                    <div
                                        key={index}
                                        className={`file-manager-file-entry file-rename-entry ${highlightOpenFocusedFileClass} ${highlightOpenFileClass}`}
                                    >
                                        <input
                                            ref={inputRef}
                                            key='unique-id'
                                            className='file-rename-input'
                                            type='text'
                                            defaultValue={file.name}
                                            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                                                if (event.key === 'Enter') {
                                                    dispatch(confirmRenameFile(inputRef.current?.value || 'error.error'))
                                                    event.preventDefault();
                                                } else if (event.key === 'Escape') {
                                                    dispatch(cancelRenameFile())
                                                }
                                            }}
                                            onBlur={() => {
                                                dispatch(confirmRenameFile(inputRef.current?.value || 'error.error'))
                                            }}
                                        />
                                    </div>
                                )
                            } else {
                                return (
                                    <div
                                        key={index}
                                        className={`file-manager-file-entry ${highlightOpenFocusedFileClass} ${highlightOpenFileClass} unselectable`}
                                        onClick={() => {
                                            dispatch(selectFile(index))
                                        }}
                                        onContextMenu={(e: React.MouseEvent) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            dispatch(showContextMenu({
                                                options: [
                                                    { name: 'New File' },
                                                    {
                                                        name: 'Delete File',
                                                        data: {
                                                            deletedFileIndex: index
                                                        }
                                                    },
                                                    {
                                                        name: 'Rename File',
                                                        data: {
                                                            renamedFileIndex: index,
                                                        }
                                                    }
                                                ],
                                                position: {
                                                    x: e.clientX,
                                                    y: e.clientY
                                                }
                                            }))
                                        }}
                                    >
                                        <span className='filename-start'>{name}</span>
                                        <span className='filename-end'>{extension}</span>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export { FileManager }