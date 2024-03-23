import { createContext, useContext } from 'react';
import { editor } from 'monaco-editor';

// Create a context with a default value of null
const MonacoContext = createContext<editor.IStandaloneCodeEditor | null>(null);

// there are two different "monaco" instances with different apis
// this exposes the one of them that doesn't come with a hook to expose it
export function useMonacoEditor() {
  return useContext(MonacoContext);
}

export default MonacoContext;