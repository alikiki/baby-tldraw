import { useRef, useState } from "react";
import Toolbar from "./Toolbar";
import { BabyTLCanvasProps } from "../types/canvas-types";
import { useEditor, useEditorDispatch } from "../hooks/useEditor";

export default function Canvas({ options }: BabyTLCanvasProps) {
    const [count, setCount] = useState(0);
    const editor = useEditor();
    const dispatch = useEditorDispatch();

    const height = options.height;
    const width = options.width;

    console.log(`Initiating canvas with height ${height} and width ${width}.`);

    const rCanvas = useRef<HTMLDivElement>(null);
    const rHtml = useRef<HTMLDivElement>(null);
    const rHtml2 = useRef<HTMLDivElement>(null);

    return (
        <div ref={rCanvas}>
            <div ref={rHtml}>
                Hello.
            </div>
            <div ref={rHtml2}>
                <Toolbar />
                <p>{editor.getTestString()}</p>
                <button onClick={() => {
                    setCount(count + 1);
                    dispatch({ action: 'test', input: `Test ${count}` });
                }}>Dispatch</button>
            </div>
        </div>
    )
}