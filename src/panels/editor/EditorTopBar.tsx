import '../TopBar.css';
import { BuildResult, FormatResult, useAiken } from '../../hooks/useAiken';
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
            <div className='editor-top-bar-left-side'>
                <div
                    className='title-logo top-bar-item'
                >
                    ApplicationName
                </div>
            </div>
            <div className='editor-top-bar-right-side '>
                <div
                    className={`top-bar-item editor-top-bar-item ${maybeDisabledClass}`}
                    onClick={() => {
                        let compiledFiles = []
                        let buildResults: BuildResult[] = []
                        for (let file of files.files) {
                            if (getFileLanguage(file.name) === 'aiken') {
                                compiledFiles.push(file)
                                const buildResult = aiken.project.build(file.content, true) as BuildResult
                                buildResults.push(buildResult)
                            }
                        }
                        dispatch(testProject({ buildResults, compiledFiles }))
                    }}
                >
                    <span className='editor-top-bar-play-icon'>▶</span> Test
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
                    <span className='editor-top-bar-build-icon'>🛠</span> Build
                </div>
                <div
                    className='top-bar-item editor-top-bar-item'

                >
                    <span className='editor-top-bar-format-icon'>✎</span> Format
                </div>
                <div className='top-bar-item editor-top-bar-item'>
                <span className='editor-top-bar-share-icon'>☎</span> Share
                </div>
            </div>
        </div>
    )
}

export { EditorTopBar }