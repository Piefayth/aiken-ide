import { editor } from 'monaco-editor';
import './TopBar.css';

type EditorTopBarProps = {
    monaco: editor.IStandaloneCodeEditor | null
}


function EditorTopBar({ monaco }: EditorTopBarProps) {
    return (
        <div className='top-bar editor-top-bar'>
            <div 
                className='top-bar-item editor-top-bar-item'
                onClick={() => {
                    console.log(monaco?.getValue())
                }}
            >
            ▶ Test  
            </div>
            <div className='top-bar-item editor-top-bar-item'>
            🛠 Check 
            </div>
            <div className='top-bar-item editor-top-bar-item'>
            ✎ Format 
            </div>
            <div className='top-bar-item editor-top-bar-item'>
            ☎ Share 
            </div>
        </div>
    )
}

export { EditorTopBar }