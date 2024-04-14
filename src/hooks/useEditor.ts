import { useContext, createContext } from 'react';
import { Editor } from '../editor/Editor';

export const EditorContext = createContext<Editor>({} as Editor);

export function useEditor() {
    return useContext(EditorContext);
}