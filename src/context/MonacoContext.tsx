import { createContext, useContext } from 'react';
import { editor } from 'monaco-editor';

// Create a context with a default value of null
const MonacoContext = createContext<editor.IStandaloneCodeEditor | null>(null);

export function useMonacoEditor() {
  return useContext(MonacoContext);
}

export default MonacoContext;