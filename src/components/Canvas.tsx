import { useRef, useState, useEffect } from "react";
import { BabyTLCanvasProps } from "../types/canvas-types";
import { BabyTLCamera } from "../types/editor-types";
import InnerCanvas from "./InnerCanvas";

interface Point {
    x: number,
    y: number
}

export default function Canvas({ options }: BabyTLCanvasProps) {
    const [camera, setCamera] = useState<BabyTLCamera>({ x: 0, y: 0, z: 1 });
    const [initialCamera, setInitialCamera] = useState<BabyTLCamera>({ x: 0, y: 0, z: 1 });
    const [startPos, setStartPos] = useState<Point>({ x: 0, y: 0 });

    const [interactionEvents, setInteractionEvents] = useState({
        pointerDown: false,
        metaDown: false
    });

    const rCanvas = useRef<HTMLDivElement>(null);

    const viewportToGlobal = (point: Point, camera: BabyTLCamera): Point => {
        return {
            x: (point.x / camera.z) - camera.x,
            y: (point.y / camera.z) - camera.y
        }
    }

    const globalToViewport = (point: Point, camera: BabyTLCamera): Point => {
        return {
            x: (point.x + camera.x) * camera.z,
            y: (point.y + camera.y) * camera.z
        }
    }

    const zoomCamera = (point: Point, camera: BabyTLCamera, zoomOffset: number): BabyTLCamera => {
        const zoom = camera.z - zoomOffset * camera.z;

        const p1 = viewportToGlobal(point, camera);
        const p2 = viewportToGlobal(point, { ...camera, z: zoom });

        return {
            x: camera.x + (p2.x - p1.x),
            y: camera.y + (p2.y - p1.y),
            z: zoom
        };
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        console.log("pointer down");
        setInitialCamera(camera);
        setStartPos({ x: e.clientX, y: e.clientY });
        setInteractionEvents({ ...interactionEvents, pointerDown: true });
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        const { pointerDown } = interactionEvents;
        if (!pointerDown) return;

        console.log(e);

        const offsetX = startPos.x - e.clientX;
        const offsetY = startPos.y - e.clientY;

        const newCameraX = initialCamera.x - (offsetX / camera.z);
        const newCameraY = initialCamera.y - (offsetY / camera.z);

        setCamera({ x: newCameraX, y: newCameraY, z: camera.z });
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setInteractionEvents({ ...interactionEvents, pointerDown: false });
        setInitialCamera(camera);
    }

    const pointerHandlers = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp
    };



    useEffect(() => {
        const handleZoom = (e: React.WheelEvent) => {
            e.preventDefault();
            console.log(e);
            const { clientX: x, clientY: y, deltaY, metaKey } = e;

            if (!metaKey) return;

            // IMPORTANT:
            // Using a functional update here to ensure that the camera updates
            // are properly ordered.
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