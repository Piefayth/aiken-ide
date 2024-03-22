import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';


type MonacoEditorProps = {
    onLoad?: (editor: editor.IStandaloneCodeEditor) => void
}

function MonacoEditor({ onLoad }: MonacoEditorProps) {
    const monaco = useMonaco()
    const files = useSelector((state: RootState) => state.files)
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    
    // this block adjusts the current visible file in the editor
    if (editorRef.current && monaco) {
        const selectedFile = files.files[files.currentFileFocusedInEditorIndex];
        
        if (selectedFile) {
            const models = monaco.editor.getModels();
    
            let model = models.find(m => m.uri.path.endsWith(selectedFile.name));
        
            if (!model) {
                model = monaco.editor.createModel(
                    selectedFile.content,
                    'aiken',    // TODO: figure out file type from extension
                    monaco.Uri.parse(selectedFile.name)
                );
            }
            
            editorRef.current.setModel(model);
        } else {
            // no open files
            // or there is a bug where the currentFileFocusedInEditorIndex is not a valid index into the files array
            editorRef.current.setModel(null);
        }

    }

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        if (onLoad) {
            onLoad(editor);
        }
    };

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
        return <Editor 
            height="90vh"
            width="100%" 
            theme="aiken-theme" 
            defaultLanguage="aiken" 
            defaultValue={files.files[0].content} 
            options={{ minimap: { enabled: false } }}
            onMount={handleEditorDidMount}
        />
    } else {
        return null
    }
}

export { MonacoEditor }