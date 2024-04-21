import { useRef, useState, useEffect } from "react";
import { BabyTLCanvasProps } from "../types/canvas-types";
import { BabyTLCamera, Shape, ShapeStore, Point } from "../types/editor-types";
import InnerCanvas from "./InnerCanvas";

type Tool = "hand" | "draw" | "select";

export default function Canvas({ options }: BabyTLCanvasProps) {
    const rCanvas = useRef<HTMLDivElement>(null);

    // global canvas states
    const [camera, setCamera] = useState<BabyTLCamera>({ x: 0, y: 0, z: 1 });
    const [tool, setTool] = useState<Tool>("hand");
    const [interactionEvents, setInteractionEvents] = useState({
        pointerDown: false,
        metaDown: false
    });

    // hand tool
    const [startPos, setStartPos] = useState<Point>({ x: 0, y: 0 });
    const [initialCamera, setInitialCamera] = useState<BabyTLCamera>({ x: 0, y: 0, z: 1 });

    // draw tool
    const [shapes, setShapes] = useState<ShapeStore>({} as ShapeStore);
    const [activeShapeId, setActiveShapeId] = useState<string | null>(null);

    // select tool
    const [selectionBox, setSelectionBox] = useState<Shape | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        if (tool === "hand") {
            setInitialCamera(camera);
        } else if (tool === "draw") {
            resetShapeHighlight();
            setActiveShapeId(`shape-${Date.now()}`);
        } else if (tool === "select") {
            setSelectionBox({ type: "rect", x: e.clientX, y: e.clientY, width: 0, height: 0, selected: true });
        }

        setStartPos({ x: e.clientX, y: e.clientY });
        setInteractionEvents({ ...interactionEvents, pointerDown: true });
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        const { pointerDown } = interactionEvents;
        if (!pointerDown) return;

        const offsetX = startPos.x - e.clientX;
        const offsetY = startPos.y - e.clientY;

        if (tool === "hand") {
            const newCameraX = initialCamera.x - (offsetX / camera.z);
            const newCameraY = initialCamera.y - (offsetY / camera.z);

            setCamera({ x: newCameraX, y: newCameraY, z: camera.z });
        } else if (tool === "draw") {
            const p1 = viewportToGlobal(startPos, camera);
            const p2 = viewportToGlobal({ x: e.clientX, y: e.clientY }, camera);

            const width = Math.abs(p2.x - p1.x);
            const height = Math.abs(p2.y - p1.y);

            const x = Math.min(p1.x, p2.x);
            const y = Math.min(p1.y, p2.y);

            let id: string;
            if (!activeShapeId) {
                id = `shape-${Date.now()}`;
                setActiveShapeId(id);
            } else {
                id = activeShapeId;
            }

            const newShape: Shape = {
                type: "rect",
                x, y, width, height, selected: false
            }

            setShapes((shapes) => addShapes(shapes, id, newShape))
        } else if (tool === "select") {
            const p1 = viewportToGlobal(startPos, camera);
            const p2 = viewportToGlobal({ x: e.clientX, y: e.clientY }, camera);

            const width = Math.abs(p2.x - p1.x);
            const height = Math.abs(p2.y - p1.y);

            const x = Math.min(p1.x, p2.x);
            const y = Math.min(p1.y, p2.y);

            const newSelectionBox = { type: "rect", x, y, width, height, selected: true };

            for (const [id, shape] of Object.entries(shapes)) {
                const intersecting = intersects(shape, newSelectionBox) || intersects(newSelectionBox, shape);
                if (shape.selected !== intersecting) {
                    setSelectedIds((selectedIds) => {
                        if (intersecting) return [...selectedIds, id];
                        return selectedIds.filter((selectedId) => selectedId !== id);
                    })
                    changeShapeHighlight(id);
                }
            }

            setSelectionBox(newSelectionBox);
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setInteractionEvents({ ...interactionEvents, pointerDown: false });

        if (tool === "hand") {
            setInitialCamera(camera);
        } else if (tool === "draw") {
            setActiveShapeId(null);
            setTool("select");
        } else if (tool === "select") {
            setSelectionBox(null);
            console.log(selectedIds);
        }
    }

    const isInside = (point: Point, shape: Shape): boolean => {
        return point.x >= shape.x && point.x <= shape.x + shape.width &&
            point.y >= shape.y && point.y <= shape.y + shape.height;
    }

    const intersects = (shape: Shape, selection: Shape): boolean => {
        const p1 = { x: shape.x, y: shape.y };
        const p2 = { x: shape.x + shape.width, y: shape.y };
        const p3 = { x: shape.x, y: shape.y + shape.height };
        const p4 = { x: shape.x + shape.width, y: shape.y + shape.height };

        return isInside(p1, selection) || isInside(p2, selection) || isInside(p3, selection) || isInside(p4, selection);
    }

    const addShapes = (shapes: ShapeStore, newShapeId: string, newShape: Shape): ShapeStore => {
        const newShapes = { ...shapes };
        newShapes[newShapeId] = newShape;
        return newShapes;
    }

    const changeShapeHighlight = (id: string) => {
        const newShapes = { ...shapes };
        const oldShape = shapes[id];

        const newShape = { ...oldShape, selected: !oldShape.selected };
        newShapes[id] = newShape;

        setShapes(newShapes);
    }

    const resetShapeHighlight = () => {
        const newShapes = { ...shapes };
        for (const [id, shape] of Object.entries(shapes)) {
            const newShape = { ...shape, selected: false };
            newShapes[id] = newShape;
        }

        setShapes(newShapes);
    }

    const pointerHandlers = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp
    };

    useEffect(() => {
        const handleZoom = (e: React.WheelEvent) => {
            e.preventDefault();
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
            <div className="toolbar" style={{ zIndex: 9999 }}>
                <button onClick={() => setTool("hand")}>🖐️</button>
                <button onClick={() => setTool("select")}>👆</button>
                <button onClick={() => setTool("draw")}>🖊️</button>
            </div>
            <div ref={rCanvas} className="canvas"  {...pointerHandlers}>
                <InnerCanvas camera={camera} shapes={shapes} selectionBox={selectionBox} />
            </div>
        </div>
    )
}  