(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

import { useState } from 'react'
import './App.css'
import { useAiken } from './hooks/useAiken'
import { MonacoEditor } from './panels/editor/MonacoEditor'
import { EditorTopBar } from './panels/editor/EditorTopBar'
import { ManagementTopBar } from './panels/management/ManagementTopBar'
import { ManagementPanel } from './panels/management/ManagementPanel'
import { editor } from 'monaco-editor'
import MonacoContext from './context/MonacoContext'
import { EditorTabs } from './panels/editor/EditorTabs'
import { FileManager } from './panels/editor/FileManager'
import Tooltip from './components/Tooltip'
import { ContextMenu } from './components/ContextMenu'
import { ManagementTabs } from './panels/management/ManagementTabs'
import { Settings } from './panels/settings/Settings'

function App() {
  const aiken = useAiken()
  const [isMonacoStartingUp, setIsMonacoStartingUp] = useState<boolean>(true)
  const [monaco, setMonaco] = useState<editor.IStandaloneCodeEditor | null>(null)

  const loadingVisibilityClass = aiken.isLoading || isMonacoStartingUp ? '' : 'hidden'
  const mainLayoutVisibilityClass = aiken.isLoading || isMonacoStartingUp ? 'hidden': ''

  return (() => {
      return (
        <MonacoContext.Provider value={monaco}>
          <Tooltip />
          <ContextMenu />
          <div className={`main-layout-container ${loadingVisibilityClass}`}>
            !!!Loading... { /* TODO: make a loading component */}
          </div>
          <div className={`main-layout-container ${mainLayoutVisibilityClass}`}>
            <div className='editor-and-management-view-container'>
              <div className='editor-container'>
                <EditorTopBar />
                <div className='editor-content-container'>
                  <FileManager />
                  <div className='editor-and-tabs-container'>
                    <EditorTabs />
                    <MonacoEditor 
                      onLoad={(editor) => {
                        setMonaco(editor)
                        setIsMonacoStartingUp(false)
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className='management-panel-container'>
                <ManagementTopBar />
                <ManagementTabs />
                <ManagementPanel />
              </div>
            </div>
          </div>
        </MonacoContext.Provider>
      )
  })()

}

export default App
