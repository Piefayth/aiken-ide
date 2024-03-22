import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { splitFilename } from "../../util/strings"
import { selectFile, addFile, confirmRenameFile, cancelRenameFile} from "../../features/files/filesSlice"
import { useEffect, useRef } from "react";
import { hideTooltip, showTooltip } from "../../features/tooltip/tooltipSlice";
import { TOOLTIP_EXPIRE_TIME_MS } from "../../constants";

function FileManager() {
    const files = useSelector((state: RootState) => state.files)
    const dispatch = useDispatch()

    const inputRef = useRef<HTMLInputElement>(null)
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
    
    useEffect(() => {
        if (files.beingRenamedFileIndex !== -1 && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [files.beingRenamedFileIndex])

    useEffect(() => {
        if (!files.renameFileError && timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current)
            dispatch(hideTooltip())
        }

        const rect = inputRef.current?.getBoundingClientRect()

        if ( rect && files.renameFileError) {
            if (timeoutIdRef.current !== null) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null
            }

            dispatch(showTooltip({
                message: files.renameFileError,
                position: {
                    x: rect?.x + 100,
                    y: rect?.y - 10
                }
            }))

            timeoutIdRef.current = setTimeout(() => {
                dispatch(hideTooltip());
            }, TOOLTIP_EXPIRE_TIME_MS)
        }
    }, [files.renameFileError])

    return (
        <div className='file-manager-container'>
            <div className='file-manager-header'>
                <div>
                    <strong>Files</strong>
                </div>
                <div 
                    className='add-file-icon'
                    onClick={() => dispatch(addFile())}
                >
                    <span className='add-file-icon-plus'>+</span>🗎
                </div>

            </div>

            <div className='file-manager-file-list unselectable'>
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
                                className={`file-manager-file-entry ${highlightOpenFocusedFileClass} ${highlightOpenFileClass}`}
                                onClick={() => {
                                    dispatch(selectFile(index))
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
    )
}

export { FileManager }