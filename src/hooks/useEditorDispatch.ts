import { useContext, createContext } from 'react';
import { BabyTLEvent } from '../types/editor-types';

export const EditorDispatchContext = createContext<React.Dispatch<BabyTLEvent>>({} as React.Dispatch<BabyTLEvent>);

export function useEditorDispatch() {
    return useContext(EditorDispatchContext);
}