import { useRef, useState, useEffect } from "react";
import { Tool, Camera, Shape, ShapeStore, Point } from "../types/editor-types";
import { viewportToGlobal, zoomCamera, getBox, isInside, intersects, getVector } from "../utils";

import InnerCanvas from "./InnerCanvas";

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

    const addShapes = (shapes: ShapeStore, newShapeId: string, newShape: Shape): ShapeStore => {
        const newShapes = { ...shapes };
        newShapes[newShapeId] = newShape;
        return newShapes;
    }

    const modifyShapes = (idsToModify: string[], modFn: (_s: Shape) => Shape) => {
        const newShapes = { ...shapes };
        for (const id of idsToModify) {
            const shape = shapes[id];
            const newShape = modFn(shape);
            newShapes[id] = newShape;
        }

        setShapes(newShapes);
    }

    const changeShapeHighlight = (id: string) => {
        modifyShapes([id], (s: Shape) => ({ ...s, selected: !s.selected }))
    }

    const changeShapePosition = (ids: string[], offsetX: number, offsetY: number) => {
        modifyShapes(
            ids,
            (s: Shape) => {
                if (!s.tmpX) s.tmpX = s.x;
                if (!s.tmpY) s.tmpY = s.y;

                return { ...s, x: s.tmpX + offsetX, y: s.tmpY + offsetY }
            }
        );
    };

    const resetShapeHighlight = () => modifyShapes(Object.keys(shapes), (s) => ({ ...s, selected: false }));

    const cleanupTmpPosition = () => modifyShapes(selectedIds, (s) => ({ ...s, tmpX: s.x, tmpY: s.y }));



    // user interaction handlers
    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (e.key === "h") setTool("hand");
        if (e.key === "s") setTool("select");
        if (e.key === "d") setTool("draw");
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
        const pointerPos = { x: e.clientX, y: e.clientY };
        const globalPointerPos = viewportToGlobal(pointerPos, camera);

        setStartPos(pointerPos);
        setInteractionEvents({ ...interactionEvents, pointerDown: true });

        if (tool === "hand") {
            setInitialCamera(camera);
        }

        if (tool === "draw") {
            resetShapeHighlight();
            setActiveShapeId(`shape-${Date.now()}`);
        }

        if (tool === "select") {
            if (selectedIds.length > 0) {
                const selectedShapes = getSelectedShapes(selectedIds);
                const pointerInsideAnySelectedShape = Object.values(selectedShapes).some((shape) => isInside(globalPointerPos, shape));

                if (pointerInsideAnySelectedShape) return;

                resetShapeHighlight();
                setSelectedIds([]);
            }

            setSelectionBox({ type: "rect", x: e.clientX, y: e.clientY, width: 0, height: 0, selected: true });
        }
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        const { pointerDown } = interactionEvents;
        if (!pointerDown) return;

        const p1 = viewportToGlobal(startPos, camera);
        const p2 = viewportToGlobal({ x: e.clientX, y: e.clientY }, camera);
        const offsetVector = getVector(p1, p2);

        if (tool === "hand") {
            setCamera({
                x: initialCamera.x + offsetVector.x,
                y: initialCamera.y + offsetVector.y,
                z: camera.z
            });
        }

        if (tool === "draw") {
            const id: string = activeShapeId ? activeShapeId : `shape-${Date.now()}`;
            if (!activeShapeId) setActiveShapeId(id);

            const { x, y, width, height } = getBox(p1, p2);
            const newShape: Shape = {
                type: "rect",
                x, y, width, height, selected: false
            }

            setShapes((shapes) => addShapes(shapes, id, newShape))
        }

        if (tool === "select") {
            // pointer down + no selection box means the original click
            // was inside of a selected shape, so we should move the selected shapes
            if (!selectionBox) {
                changeShapePosition(selectedIds, offsetVector.x, offsetVector.y);
                return
            }

            // pointer down + selection box means we are selecting shapes
            const { x, y, width, height } = getBox(p1, p2);
            const newSelectionBox = { type: "rect", x, y, width, height, selected: true };

            setSelectionBox(newSelectionBox);

            for (const [id, shape] of Object.entries(shapes)) {
                const intersecting = intersects(shape, newSelectionBox) || intersects(newSelectionBox, shape);
                if (shape.selected !== intersecting) {
                    changeShapeHighlight(id);
                    setSelectedIds((selectedIds) => {
                        if (intersecting) return [...selectedIds, id];
                        return selectedIds.filter((selectedId) => selectedId !== id);
                    })
                }
            }
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setInteractionEvents({ ...interactionEvents, pointerDown: false });

        if (tool === "hand") {
            setInitialCamera(camera);
        }

        if (tool === "draw") {
            setActiveShapeId(null);
            cleanupTmpPosition();
        }

        if (tool === "select") {
            setSelectionBox(null);
            cleanupTmpPosition();
        }
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

    const cursorChoice = () => {
        if (tool === "hand") return "grab";
        if (tool === "draw") return "crosshair";
        return "default";
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", cursor: cursorChoice() }}>
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