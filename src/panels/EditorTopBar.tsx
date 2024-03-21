import './TopBar.css';
import { BuildResult, FormatResult, useAiken } from '../hooks/useAiken';
import { useDispatch } from 'react-redux';
import { testProject } from '../features/aiken/projectSlice'
import { useMonacoEditor } from '../context/MonacoContext';


function EditorTopBar() {
    const aiken = useAiken()
    const monacoEditor = useMonacoEditor()
    const dispatch = useDispatch()

    return (
        <div className='top-bar editor-top-bar'>
            <div 
                className='top-bar-item editor-top-bar-item'
                onClick={() => {
                    const code = monacoEditor?.getValue() || ''
                    const buildResult: BuildResult = aiken.project.build(code, true)
                    dispatch(testProject({ buildResult, code }))
                }}
            >
            ▶ Test  
            </div>
            <div 
                className='top-bar-item editor-top-bar-item'
                onClick={() => {
                    const code = monacoEditor?.getValue() || ''
                    const buildResult: BuildResult = aiken.project.build(code, false)
                    dispatch(testProject({ buildResult, code }))
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