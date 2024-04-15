import './App.css'
import { useState } from 'react'
import ChildComponent from './components/ChildComponent'
import { RandomThingContext, RandomThing } from './hooks/useRandomThing'


function App() {
  const [randomThing, _] = useState<RandomThing>(new RandomThing());

  console.log(randomThing);

  return (
    <>
      <RandomThingContext.Provider value={randomThing}>
        <ChildComponent name={"child 1"} />
        <ChildComponent name={"child 2"} />
      </RandomThingContext.Provider>
    </>
  )
}

export default App
