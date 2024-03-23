import '../TopBar.css';
import { FormatResult, useAiken } from '../../hooks/useAiken';
import { useDispatch, useSelector } from 'react-redux';
import { testProject } from '../../features/aiken/projectSlice'
import { useMonacoEditor } from '../../context/MonacoContext';
import { RootState } from '../../app/store';
import { getFileLanguage } from '../../constants';

function EditorTopBar() {
    const aiken = useAiken()
    const monacoEditor = useMonacoEditor()
    const files = useSelector((state: RootState) => state.files)
    const dispatch = useDispatch()

    let maybeDisabledClass = ''
    
    return (
        <div className='top-bar editor-top-bar'>
            <div 
                className={`top-bar-item editor-top-bar-item ${maybeDisabledClass}`}
                onClick={() => {
                    let compiledFiles = []
                    let buildResults = []
                    for (let file of files.files) {
                        if (getFileLanguage(file.name) === 'aiken') {
                            compiledFiles.push(file)
                            buildResults.push(aiken.project.build(file.content, true))
                        }
                    }
                    dispatch(testProject({ buildResults, compiledFiles }))
                }}
            >
            ▶ Test  
            </div>
            <div 
                className={`top-bar-item editor-top-bar-item ${maybeDisabledClass}`}
                onClick={() => {
                    let compiledFiles = []
                    let buildResults = []
                    for (let file of files.files) {
                        if (getFileLanguage(file.name) === 'aiken') {
                            compiledFiles.push(file)
                            buildResults.push(aiken.project.build(file.content, false))
                        }
                    }
                    dispatch(testProject({ buildResults, compiledFiles }))
                }}
            >
            🛠 Build 
            </div>
            <div 
                className='top-bar-item editor-top-bar-item'
                onClick={() => {
                    const code = monacoEditor?.getValue() || ''
                    const formattedCode: FormatResult = aiken.project.format(code)
                    monacoEditor?.setValue(formattedCode.formatted_code || code)
                }}
            >
            ✎ Format 
            </div>
            <div className='top-bar-item editor-top-bar-item'>
            ☎ Share 
            </div>
        </div>
    )
}

export { EditorTopBar }