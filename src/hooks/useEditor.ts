import { useContext, createContext } from 'react';
import { Editor } from '../editor/Editor';

export const EditorContext = createContext<Editor>({} as Editor);
export const EditorDispatchContext = createContext(null);

export function useEditor() {
    return useContext(EditorContext);
}

export function useEditorDispatch() {
    return useContext(EditorDispatchContext);
}