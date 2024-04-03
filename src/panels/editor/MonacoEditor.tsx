import Editor, { OnMount, useMonaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { FILE_EXTENSION_TO_MONACO_LANGUAGE } from '../../constants'
import { writeFileContents } from '../../features/files/filesSlice'


type MonacoEditorProps = {
    onLoad?: (editor: editor.IStandaloneCodeEditor) => void
}

function MonacoEditor({ onLoad }: MonacoEditorProps) {
    const monaco = useMonaco()
    const files = useSelector((state: RootState) => state.files)
    const dispatch = useDispatch()
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    
    if (editorRef.current && monaco) {
        const selectedFile = files.files[files.currentFileFocusedInEditorIndex]
        
        const models = monaco.editor.getModels()

        if (selectedFile) {
            const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.'))

            const fileLanguage = FILE_EXTENSION_TO_MONACO_LANGUAGE[fileExtension] || 'plaintext'

            let model = models.find(m => m.uri.path.includes(selectedFile.name))
        
            if (!model || fileLanguage != model.getLanguageId()) {
                model = monaco.editor.createModel(
                    selectedFile.content,
                    fileLanguage,
                    monaco.Uri.parse(selectedFile.name)
                )
            }
            
            editorRef.current.setModel(model)
        } else {
            // no open files
            // or there is a bug where the currentFileFocusedInEditorIndex is not a valid index into the files array
            editorRef.current.setModel(null)
        }

        // delete models for files that don't exist
        models.forEach(model => {
            const fileForModel = files.files.find(file => model.uri.path.includes(file.name))
            if (!fileForModel) {
                model.dispose()
            }
        })

    }

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor
        if (onLoad) {
            onLoad(editor)
        }
    }

    useEffect(() => {
        if (monaco) {
            monaco.languages.register({ id: 'aiken' })

            const aikenKeywords = [
                "if", "else", "when", "is", "fn", "use",
                "let", "pub", "type", "opaque", "const",
                "todo", "expect", "check", "test", "trace",
                "fail", "validator", "and", "or"
            ]

            monaco.languages.setMonarchTokensProvider('aiken', {
                keywords: aikenKeywords,
                operators: [
                    "->", "|>", "..", "<=", ">=", "==", "!=", "<", ">", "&&", "||",
                    "|", "+", "-", "/", "*", "%", "="
                ],
                digits: "\\d+(_+\\d+)*",
                octaldigits: "[0-7]+(_+[0-7]+)*",
                binarydigits: "[0-1]+(_+[0-1]+)*",
                hexdigits: "[0-9a-fA-F]+(_+[0-9a-fA-F]+)*",
                tokenizer: {
                    root: [
                        ["[a-z_$][\\w$]*", {
                            cases: {
                                "@keywords": "keyword",
                                "@default": "identifier"
                            }
                        }],
                        ["\/\/.*", "comment"],
                        ["[A-Z][\\w\\$]*", "type.identifier"],
                        ["[a-z][\\w\\$]*", "identifier"],
                        ["0[xX](@hexdigits)", "number.hex"],
                        ["0[oO]?(@octaldigits)", "number.octal"],
                        ["0[bB](@binarydigits)", "number.binary"],
                        ["(@digits)", "number"]
                    ]
                }
            })

            monaco.editor.defineTheme('aiken-theme', {
                base: 'vs-dark',
                rules: [
                    {
                        token: 'source', foreground: '#BBBBBB'
                    }
                ],
                inherit: true,
                colors: {
                    'scrollbar.shadow': '#ffffff00',
                    'editor.lineHighlightBackground': '#00000000',
                    'editor.lineHighlightBorder': '#00000000'
                }
            })
        }
    }, [monaco])

    if (monaco) {
        return(
        <div 
            style={{width:"100%", height: "90vh"}} 
            onBlur={() => { // write the file contents when the editor is defocused
                if (!monaco) {
                    return
                }

                const selectedFile = files.files[files.currentFileFocusedInEditorIndex]
                const models = monaco.editor.getModels()
                let model = models.find(m => m.uri.path.includes(selectedFile.name))

                if (!model) {
                    console.error("If this happened, there is a bug. :)")
                    return
                }

                dispatch(
                    writeFileContents({
                        index: files.currentFileFocusedInEditorIndex,
                        content: model!!.getValue()
                    })
                )
            }
        }
        >
         <Editor 
            height="calc(97vh - 60px)"
            width="100%" 
            theme="aiken-theme" 
            defaultLanguage="aiken" 
            className='monaco-customizer'
            defaultValue={files.files[0].content} 
            options={{ minimap: { enabled: false } }}
            onMount={handleEditorDidMount}
        />
        </div>)
    } else {
        return null
    }
}

export { MonacoEditor }