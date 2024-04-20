import { useRef, useState, useEffect } from "react";
import { BabyTLCanvasProps } from "../types/canvas-types";
import { BabyTLCamera } from "../types/editor-types";
import InnerCanvas from "./InnerCanvas";

interface Point {
    x: number,
    y: number
}

export default function Canvas({ options }: BabyTLCanvasProps) {
    const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });
    const [initialCamera, setInitialCamera] = useState({ x: 0, y: 0, z: 1 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const [interactionEvents, setInteractionEvents] = useState({
        pointerDown: false,
        metaDown: false
    });

    const rCanvas = useRef<HTMLDivElement>(null);

    const viewportToGlobal = (point: Point, camera: BabyTLCamera): BabyTLCamera => {
        return {
            x: (point.x / camera.z) - camera.x,
            y: (point.y / camera.z) - camera.y,
            z: camera.z
        }
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setInteractionEvents({ ...interactionEvents, pointerDown: true });
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        const { pointerDown } = interactionEvents;
        if (!pointerDown) return;

        const offsetX = startPos.x - e.clientX;
        const offsetY = startPos.y - e.clientY;

        const newCameraX = initialCamera.x - (offsetX / camera.z);
        const newCameraY = initialCamera.y - (offsetY / camera.z);

        setCamera({ x: newCameraX, y: newCameraY, z: camera.z });
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setInteractionEvents({ ...interactionEvents, pointerDown: false });
        setInitialCamera({ ...camera });
    }

    // const handleKeyDown = (e: React.KeyboardEvent) => {
    //     if (e.metaKey) {
    //         editorDispatch({ object: "keyboard", command: { key: "meta", direction: "down" } });
    //     }
    // };

    // const handleKeyUp = (e: React.KeyboardEvent) => {
    //     if (!e.metaKey) {
    //         editorDispatch({ object: "keyboard", command: { key: "meta", direction: "up" } });
    //     }
    // };

    // BUG:
    // basically the problem is that the zooming is not happening around the pointer
    // every time I zoom, the position of my pointer in global space changes very slightly

    // the pointer in global space should be invariant.

    // like concenptually i dont understand how the zoom works.

    const pointerHandlers = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp
    };


    // const keyHandlers = {
    //     onKeyDown: handleKeyDown,
    //     onKeyUp: handleKeyUp
    // }

    const zoomCamera = (point: Point, camera: BabyTLCamera, zoomOffset: number) => {
        const zoom = camera.z - zoomOffset * camera.z;

        const p1 = viewportToGlobal(point, camera);
        const p2 = viewportToGlobal(point, { ...camera, z: zoom });

        return {
            x: camera.x + (p2.x - p1.x),
            y: camera.y + (p2.y - p1.y),
            z: zoom
        };
    }

    useEffect(() => {
        const handleZoom = (e: React.WheelEvent) => {
            e.preventDefault();
            console.log(e);
            const { offsetX: x, offsetY: y, deltaY, metaKey } = e;

            if (!metaKey) return;

            console.log('client coords:', x, y);
            console.log('----');

            setCamera((camera) => zoomCamera({ x: x, y: y }, camera, deltaY * 0.01));
        }

        const elm = rCanvas.current;
        if (!elm) return;

        elm.addEventListener('wheel', handleZoom, { passive: false });

        return () => {
            elm.removeEventListener('wheel', handleZoom);
        }
    }, [rCanvas])

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <div ref={rCanvas} className="canvas"  {...pointerHandlers}>
                <InnerCanvas camera={camera} />
            </div>
        </div>
    )
}  