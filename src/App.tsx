import { useState } from 'react';
import './App.css'
import { useAiken } from './hooks/useAiken';
import { MonacoEditor } from './panels/MonacoEditor';
import { EditorTopBar } from './panels/EditorTopBar';
import { ManagementTopBar } from './panels/ManagementTopBar';
import { ManagementPanel } from './panels/ManagementPanel';
import { editor } from 'monaco-editor';

function App() {
  const aiken = useAiken()
  const [isMonacoStartingUp, setIsMonacoStartingUp] = useState<boolean>(true)
  const [monaco, setMonaco] = useState<editor.IStandaloneCodeEditor | null>(null)

  const loadingVisibilityClass = aiken.isLoading || isMonacoStartingUp ? '' : 'hidden'
  const mainLayoutVisibilityClass = aiken.isLoading || isMonacoStartingUp ? 'hidden': ''

  return (() => {
      return (
        <>
          <div className={`main-layout-container ${loadingVisibilityClass}`}>
            !!!Loading...
          </div>
          <div className={`main-layout-container ${mainLayoutVisibilityClass}`}>
            <div className='editor-and-management-view-container'>
              <div className='editor-container'>
                <EditorTopBar monaco={monaco} />
                <MonacoEditor onLoad={(editor) => {
                  setMonaco(editor)
                  setIsMonacoStartingUp(false)
                }}/>
              </div>

              {
                (() => {
                  if (aiken.isLoading || isMonacoStartingUp) {
                    return null
                  } else {
                    return (
                      <div className='management-panel-container'>
                        <ManagementTopBar />
                        <ManagementPanel />
                      </div>
                    )
                  }
                })()
              }
            </div>
          </div>
        </>
      )
  })()

}

export default App
