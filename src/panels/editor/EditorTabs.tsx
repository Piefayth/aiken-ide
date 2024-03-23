import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import './Editor.css'
import { splitFilename } from '../../util/strings'
import { closeFile, pendingCloseFile, selectFile } from '../../features/files/filesSlice'

function EditorTabs() {
    const files = useSelector((state: RootState) => state.files)
    const dispatch = useDispatch()
    const containerRef = useRef<HTMLDivElement>(null) 
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (containerRef.current) {
            containerRef.current.scrollLeft += e.deltaY * 2
        }
    }

    return (
        <div 
            className='editor-tab-container' 
            ref={containerRef} 
            onWheel={handleWheel}
        >
            {files.openFileIndices.map((fileIndex) => {
                const file = files.files[fileIndex]
                const { name, extension } = splitFilename(file.name)
                const openFocusedTabClass = files.currentFileFocusedInEditorIndex === fileIndex ? 'highlight-open-focused-tab' : ''

                return (
                    <div 
                        key={fileIndex} 
                        className={`editor-tab ${openFocusedTabClass}`}
                        onMouseUp={(e: React.MouseEvent) => {
                            e.preventDefault()
                            if (e.button === 1) {
                                dispatch(closeFile(fileIndex))
                            }
                        }}
                        onMouseDown={(e: React.MouseEvent) => {
                            e.preventDefault()
                            if (e.button === 0) {
                                dispatch(selectFile(fileIndex))
                            } else if (e.button === 1) {
                                dispatch(pendingCloseFile(fileIndex))
                            }
                        }}
                        onMouseLeave={() => {
                            if (files.pendingCloseFileIndex === fileIndex) {
                                dispatch(pendingCloseFile(-1))
                            }
                        }}
                    >
                        <div className='editor-tab-label unselectable'>
                            <span className='filename-start'>{name}</span>
                            <span className='filename-end'>{extension}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export { EditorTabs }