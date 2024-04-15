import { useEffect } from "react";
import { useRandomThing } from "../hooks/useRandomThing";

function ChildComponent(props) {
    const randomThing = useRandomThing();

    const updateValueTheLegitWay = () => {
        console.log(randomThing.getValue());
        randomThing.setValue(randomThing.getValue() + 1);
    }

    const updateValueTheNonLegitWay = () => {
    }

    const updateBothTheLegitWay = () => {
        randomThing.setValue(randomThing.value + 1);
    }

    return (
        <div>
            <p>Some value: {randomThing.getValue()}</p>
            <div style={{ display: "flex" }}>
                <button onClick={updateValueTheLegitWay}>Update only randomValue the legit way.</button>
                <button onClick={updateValueTheNonLegitWay}>Update count the legit way and randomValue the non-legit way.</button>
                <button onClick={updateBothTheLegitWay}>Update both the legit way.</button>
            </div>
        </div >
    )
}

export default ChildComponent