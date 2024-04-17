import { useRef, useState } from "react";
import InnerCanvas from "./InnerCanvas";
import { BabyTLCanvasProps } from "../types/canvas-types";
import { useEditor } from "../hooks/useEditor";
import { useEditorDispatch } from "../hooks/useEditorDispatch";

export default function Canvas({ options }: BabyTLCanvasProps) {
    const editor = useEditor();
    const editorDispatch = useEditorDispatch();
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });


    const rCanvas = useRef<HTMLDivElement>(null);

    console.log("re-rendering outer canvas.");

    const debuggingPointerState = () => {
        console.log('isPointerDown:', editor.isPointerDown);
        console.log('isPointerDragging:', editor.isPointerDragging);
        console.log('camera:', editor.camera);
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        editorDispatch({ object: "pointer", command: "down" });
        console.log('pointer down');
        setStartPos({ x: e.clientX, y: e.clientY });
        debuggingPointerState();
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!editor.isPointerDown) return;
        editorDispatch({ object: "pointer", command: "drag" });

        const offsetX = e.clientX - startPos.x;
        const offsetY = e.clientY - startPos.y;

        const newCameraX = editor.initialCamera.x + offsetX;
        const newCameraY = editor.initialCamera.y + offsetY;

        editorDispatch({ object: "camera", command: { x: newCameraX, y: newCameraY } });
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        editorDispatch({ object: "pointer", command: "up" });
        editorDispatch({ object: "initial-camera", command: editor.camera })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.metaKey) {
            editorDispatch({ object: "keyboard", command: { key: "meta", direction: "down" } });
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (!e.metaKey) {
            editorDispatch({ object: "keyboard", command: { key: "meta", direction: "up" } });
        }
    };

    const handleZoom = (e: React.WheelEvent) => {
        e.preventDefault();
        if (!editor.isMetaDown) return;
        console.log('zooming', e.deltaY);
    }

    const pointerHandlers = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp
    };

    const wheelHandlers = {
        onWheel: handleZoom
    }

    const keyHandlers = {
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp
    }

    return (
        <div ref={rCanvas} style={{ width: options.width, height: options.height, border: "1px solid black" }} {...pointerHandlers} {...wheelHandlers} {...keyHandlers} tabIndex={0} draggable={false}>
            <InnerCanvas />
        </div>
    )
}  