import './App.css'
import { useState } from 'react'
import { BabyTLCanvasOptions } from './types/canvas-types'
import Canvas from './components/Canvas'
import { Editor } from './editor/Editor'
import { EditorContext } from './hooks/useEditor'


function App() {
  const [editor, setEditor] = useState(new Editor({
    store: {
      atoms: new Map()
    },
    tools: [],
  }))

  const defaultCanvasOptions: BabyTLCanvasOptions = {
    width: 800,
    height: 600
  }

  return (
    <>
      <EditorContext.Provider value={editor}>
        <Canvas options={defaultCanvasOptions} />
      </EditorContext.Provider>
    </>
  )
}

export default App
