import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useEffect } from 'react';


type MonacoEditorProps = {
    onLoad?: (editor: editor.IStandaloneCodeEditor) => void
}

const SOME_AIKEN_CODE = `use aiken/list
use aiken/transaction.{
  ScriptContext
}

type CoolTokenRedeemer {
  guessed_word: ByteArray
}

type FancyType {
  code_word: ByteArray
}

validator(fancy: FancyType) {
  fn mint_my_cool_token(redeemer: CoolTokenRedeemer, _ctx: ScriptContext) -> Bool {
      redeemer.guessed_word == fancy.code_word
  }
}

fn quicksort(xs: List<Int>) -> List<Int> {
  when xs is {
    [] ->
      []
    [p, ..tail] -> {
      let before = tail |> list.filter(fn(x) { x < p }) |> quicksort
      let after = tail |> list.filter(fn(x) { x >= p }) |> quicksort
      list.concat(before, [p, ..after])
    }
  }
}

test quicksort_0() {
  quicksort([]) == []
}

test quicksort_1() {
  quicksort([3, 2, 1, 4]) == [1, 2, 3, 4]
}

test quicksort_2() {
  quicksort([1, 2, 3, 4]) == [1, 2, 3, 4]
}
`

function MonacoEditor({ onLoad }: MonacoEditorProps) {
    const monaco = useMonaco()

    const handleEditorDidMount: OnMount = (editor) => {
        if (onLoad) {
            onLoad(editor)
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
            width="60vw" 
            theme="aiken-theme" 
            defaultLanguage="aiken" 
            defaultValue={SOME_AIKEN_CODE} 
            options={{ minimap: { enabled: false } }}
            onMount={handleEditorDidMount}
        />
    } else {
        return null
    }
}

export { MonacoEditor }