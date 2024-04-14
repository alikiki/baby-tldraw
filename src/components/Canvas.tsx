import { useRef, useState } from "react";
import Toolbar from "./Toolbar";
import { BabyTLCanvasProps } from "../types/canvas-types";
import { useEditor } from "../hooks/useEditor";

export default function Canvas({ options }: BabyTLCanvasProps) {
    const [count, setCount] = useState(0);
    const editor = useEditor();

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
                    editor.setTestString(`Count: ${count}`);
                }}>Dispatch</button>
            </div>
        </div>
    )
}