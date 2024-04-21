import { useRef, useState, useEffect } from "react";
import { Camera, Shape, ShapeStore, Point } from "../types/editor-types";
import { viewportToGlobal, zoomCamera } from "../utils";

import InnerCanvas from "./InnerCanvas";

type Tool = "hand" | "draw" | "select";

export default function Canvas() {
    const rCanvas = useRef<HTMLDivElement>(null);

    // global canvas states
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, z: 1 });
    const [tool, setTool] = useState<Tool>("hand");
    const [interactionEvents, setInteractionEvents] = useState({
        pointerDown: false,
        metaDown: false
    });

    // hand tool
    const [startPos, setStartPos] = useState<Point>({ x: 0, y: 0 });
    const [initialCamera, setInitialCamera] = useState<Camera>({ x: 0, y: 0, z: 1 });

    // draw tool
    const [shapes, setShapes] = useState<ShapeStore>({} as ShapeStore);
    const [activeShapeId, setActiveShapeId] = useState<string | null>(null);

    // select tool
    const [selectionBox, setSelectionBox] = useState<Shape | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);



    const getSelectedShapes = (ids: string[]): ShapeStore => {
        const selectedShapes: ShapeStore = {};
        for (const id of ids) {
            selectedShapes[id] = shapes[id];
        }
        return selectedShapes;
    }

    // user interaction handlers

    const handleKeyUp = (e: React.KeyboardEvent) => {
        console.log(e);
        if (e.key === "Backspace") {
            const newShapes = { ...shapes };
            for (const id of selectedIds) {
                delete newShapes[id];
            }

            setShapes(newShapes);
            setSelectedIds([]);
        }
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        console.log(e);
        const pointerPos = { x: e.clientX, y: e.clientY };
        const globalPointerPos = viewportToGlobal(pointerPos, camera);

        setStartPos(pointerPos);
        setInteractionEvents({ ...interactionEvents, pointerDown: true });

        if (tool === "hand") {
            setInitialCamera(camera);
        } else if (tool === "draw") {
            resetShapeHighlight();
            setActiveShapeId(`shape-${Date.now()}`);
        } else if (tool === "select") {
            if (selectedIds.length > 0) {
                const selectedShapes = getSelectedShapes(selectedIds);
                const pointerInsideSelectedShape = Object.values(selectedShapes).some((shape) => {
                    return isInside(globalPointerPos, shape);
                })

                if (!pointerInsideSelectedShape) {
                    resetShapeHighlight();
                    setSelectedIds([]);
                    setSelectionBox({ type: "rect", x: e.clientX, y: e.clientY, width: 0, height: 0, selected: true });
                }
            } else {
                setSelectionBox({ type: "rect", x: e.clientX, y: e.clientY, width: 0, height: 0, selected: true });
            }
        }

    }

    const handlePointerMove = (e: React.PointerEvent) => {
        const { pointerDown } = interactionEvents;
        if (!pointerDown) return;

        const offsetX = e.clientX - startPos.x;
        const offsetY = e.clientY - startPos.y;

        if (tool === "hand") {
            const newCameraX = initialCamera.x + (offsetX / camera.z);
            const newCameraY = initialCamera.y + (offsetY / camera.z);

            setCamera({ x: newCameraX, y: newCameraY, z: camera.z });
        } else if (tool === "draw") {
            let id: string;
            if (!activeShapeId) {
                id = `shape-${Date.now()}`;
                setActiveShapeId(id);
            } else {
                id = activeShapeId;
            }

            const p1 = viewportToGlobal(startPos, camera);
            const p2 = viewportToGlobal({ x: e.clientX, y: e.clientY }, camera);

            const width = Math.abs(p2.x - p1.x);
            const height = Math.abs(p2.y - p1.y);

            const x = Math.min(p1.x, p2.x);
            const y = Math.min(p1.y, p2.y);

            const newShape: Shape = {
                type: "rect",
                x, y, width, height, selected: false
            }

            setShapes((shapes) => addShapes(shapes, id, newShape))
        } else if (tool === "select") {
            const p1 = viewportToGlobal(startPos, camera);
            const p2 = viewportToGlobal({ x: e.clientX, y: e.clientY }, camera);

            if (selectionBox) {
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
            } else {
                changeShapePosition(selectedIds, offsetX / camera.z, offsetY / camera.z);
            }
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setInteractionEvents({ ...interactionEvents, pointerDown: false });

        if (tool === "hand") {
            setInitialCamera(camera);
        } else if (tool === "draw") {
            setActiveShapeId(null);
            cleanupTmpPosition();
        } else if (tool === "select") {
            setSelectionBox(null);
            cleanupTmpPosition();
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

    const cleanupTmpPosition = () => {
        const newShapes = { ...shapes };
        for (const id of selectedIds) {
            const shape = shapes[id];
            const newShape = { ...shape, tmpX: shape.x, tmpY: shape.y };
            newShapes[id] = newShape;
        }

        setShapes(newShapes);
    }

    const changeShapePosition = (ids: string[], offsetX: number, offsetY: number) => {
        const newShapes = { ...shapes };
        for (const id of ids) {
            const oldShape = shapes[id];

            if (!oldShape.tmpX) oldShape.tmpX = oldShape.x;
            if (!oldShape.tmpY) oldShape.tmpY = oldShape.y;

            const newShape = { ...oldShape, x: oldShape.tmpX + offsetX, y: oldShape.tmpY + offsetY };
            newShapes[id] = newShape;
        }

        setShapes(newShapes);
    }

    useEffect(() => {
        const handleZoom = (e: React.WheelEvent) => {
            e.preventDefault();
            const { clientX: x, clientY: y, deltaY, metaKey, ctrlKey } = e;

            if ((!metaKey) && (!ctrlKey)) return;

            // IMPORTANT:
            // Using a functional update here to ensure that the camera updates
            // are properly ordered.
            setCamera((camera) => zoomCamera({ x: x, y: y }, camera, deltaY * 0.01));
        }

        const el = rCanvas.current;
        if (!el) return;

        el.addEventListener('wheel', handleZoom, { passive: false });

        return () => {
            el.removeEventListener('wheel', handleZoom);
        }
    }, [rCanvas])

    const highlightTool = (_tool: Tool): string => {
        return tool === _tool ? "blue" : "white";
    }

    const pointerHandlers = {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp
    };

    const keyboardHandlers = {
        onKeyDown: handleKeyUp
    }

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="toolbar" style={{ zIndex: 9999 }}>
                <button onClick={() => setTool("hand")} style={{ background: highlightTool("hand") }}>🖐️</button>
                <button onClick={() => setTool("select")} style={{ background: highlightTool("select") }}>👆</button>
                <button onClick={() => setTool("draw")} style={{ background: highlightTool("draw") }}>🖊️</button>
            </div>
            <div ref={rCanvas} className="canvas"  {...pointerHandlers} {...keyboardHandlers} tabIndex={0}>
                <InnerCanvas camera={camera} shapes={shapes} selectionBox={selectionBox} />
            </div>
        </div>
    )
}  