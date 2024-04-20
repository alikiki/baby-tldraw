import './App.css'
import { BabyTLCanvasOptions } from './types/canvas-types'
import Canvas from './components/Canvas'
import { useReducer } from 'react'
import { EditorReducer } from './editor/EditorReducer'
import { Editor } from './editor/Editor'
import { EditorContext } from './hooks/useEditor'
import { EditorDispatchContext } from './hooks/useEditorDispatch'

function App() {
  const [editor, dispatch] = useReducer(
    EditorReducer,
    {
      initialCamera: {
        x: 0,
        y: 0,
        z: 1,
      },
      camera: {
        x: 0,
        y: 0,
        z: 1,
      },
      isPointerDown: false,
      isPointerDragging: false,
      isMetaDown: false
    } as Editor
  )
  const defaultCanvasOptions: BabyTLCanvasOptions = {
    width: "800px",
    height: "600px",
  }

  return (
    <div>
      <EditorContext.Provider value={editor}>
        <EditorDispatchContext.Provider value={dispatch}>
          <Canvas options={defaultCanvasOptions} />
        </EditorDispatchContext.Provider>
      </EditorContext.Provider>
    </div>
  )
}

export default App
