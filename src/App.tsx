import './App.css'
import { useReducer } from 'react'
import { BabyTLCanvasOptions } from './types/canvas-types'
import Canvas from './components/Canvas'
import { Editor } from './editor/Editor'
import { EditorContext, EditorDispatchContext } from './hooks/useEditor'
import { editorReducer } from './hooks/editorReducer'


function App() {
  const [editor, dispatch] = useReducer(
    editorReducer,
    new Editor({
      store: {
        atoms: new Map()
      },
      tools: [],
    })
  )

  const defaultCanvasOptions: BabyTLCanvasOptions = {
    width: 800,
    height: 600
  }

  return (
    <>
      <EditorContext.Provider value={editor}>
        <EditorDispatchContext.Provider value={dispatch}>
          <Canvas options={defaultCanvasOptions} />
        </EditorDispatchContext.Provider>
      </EditorContext.Provider>
    </>
  )
}

export default App
