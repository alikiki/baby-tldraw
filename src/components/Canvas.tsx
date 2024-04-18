import { useRef, useState, useEffect } from "react";
import InnerCanvas from "./InnerCanvas";
import { BabyTLCanvasProps } from "../types/canvas-types";
import { useEditor } from "../hooks/useEditor";
import { useEditorDispatch } from "../hooks/useEditorDispatch";

export default function Canvas({ options }: BabyTLCanvasProps) {
    const editor = useEditor();
    const editorDispatch = useEditorDispatch();
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const rCanvas = useRef<HTMLDivElement>(null);


    const debuggingPointerState = () => {
        console.log('isPointerDown:', editor.isPointerDown);
        console.log('isPointerDragging:', editor.isPointerDragging);
        console.log('camera:', editor.camera);
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        editorDispatch({ object: "pointer", command: "down" });
        console.log('pointer down');
        const globalX = (e.clientX / editor.camera.z) - editor.initialCamera.x;
        const globalY = (e.clientY / editor.camera.z) - editor.initialCamera.y;
        setStartPos({ x: globalX, y: globalY });
        debuggingPointerState();
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!editor.isPointerDown) return;
        editorDispatch({ object: "pointer", command: "drag" });

        const offsetX = (e.clientX / editor.camera.z) - editor.initialCamera.x - startPos.x;
        const offsetY = (e.clientY / editor.camera.z) - editor.initialCamera.y - startPos.y;

        const newCameraX = editor.initialCamera.x + offsetX;
        const newCameraY = editor.initialCamera.y + offsetY;

        editorDispatch({ object: "camera", command: { x: newCameraX, y: newCameraY, z: editor.camera.z } });
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
        if (!editor.isMetaDown) return;
        console.log('zooming', e.deltaY);
        const zoomOffset = (e.deltaY * 0.005);
        const newZoom = editor.camera.z + zoomOffset;
        const cappedZoom = Math.min(4, Math.max(0.1, newZoom));

        console.log('client pointer position', e.clientX, e.clientY);
        console.log('camera position', editor.camera.x, editor.camera.y);

        const offsetX = ((e.clientX / cappedZoom) - editor.camera.x) - editor.camera.x;
        const offsetY = ((e.clientY / cappedZoom) - editor.camera.y) - editor.camera.y;

        console.log('offsetX', offsetX);
        console.log('offsetY', offsetY);

        const newCameraX = editor.camera.x + (offsetX * zoomOffset);
        const newCameraY = editor.camera.y + (offsetY * zoomOffset);


        editorDispatch({
            object: "camera", command: {
                x: newCameraX,
                y: newCameraY,
                z: cappedZoom,
            }
        })
        editorDispatch({
            object: "initial-camera", command: {
                x: newCameraX,
                y: newCameraY,
                z: cappedZoom,
            }
        })
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

    useEffect(() => {
        if (!rCanvas.current) return;
        rCanvas.current.focus();
        rCanvas.current.addEventListener('wheel', handleZoom, { passive: false });

        return () => {
            rCanvas.current?.removeEventListener('wheel', handleZoom);
        }
    }, [rCanvas.current])

    return (
        <div ref={rCanvas} style={{ width: options.width, height: options.height, border: "1px solid black" }} {...pointerHandlers} {...wheelHandlers} {...keyHandlers} tabIndex={0} draggable={false}>
            <InnerCanvas />
        </div>
    )
}  