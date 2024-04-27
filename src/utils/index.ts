import { Point, Camera, Box, Shape, Line, ShapeInterval } from "../types/editor-types"

export const viewportToGlobal = (point: Point, camera: Camera): Point => {
    return {
        x: (point.x / camera.z) - camera.x,
        y: (point.y / camera.z) - camera.y
    }
}

export const globalToViewport = (point: Point, camera: Camera): Point => {
    return {
        x: (point.x + camera.x) * camera.z,
        y: (point.y + camera.y) * camera.z
    }
}

export const getVector = (startPos: Point, endPos: Point): Point => {
    return {
        x: endPos.x - startPos.x,
        y: endPos.y - startPos.y
    }
}

export const getBox = (startPos: Point, endPos: Point): Box => {
    return {
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
    }
}

export const isInside = (point: Point, shape: Shape): boolean => {
    return point.x >= shape.x && point.x <= shape.x + shape.width &&
        point.y >= shape.y && point.y <= shape.y + shape.height;
}

const getLines = (shape: Shape): ShapeInterval => {
    const horizontal = { start: { x: shape.x, y: shape.y }, end: { x: shape.x + shape.width, y: shape.y } };
    const vertical = { start: { x: shape.x, y: shape.y }, end: { x: shape.x, y: shape.y + shape.height } };

    return {
        horizontal,
        vertical
    }
}

const lineOverlaps = (l1: Line, l2: Line, axis: "x" | "y"): boolean => {
    if (l1.start[axis] < l2.start[axis] && l1.end[axis] > l2.start[axis]) return true;
    if (l2.start[axis] < l1.start[axis] && l2.end[axis] > l1.start[axis]) return true;

    return false;
}

export const intersects = (shape: Shape, selection: Shape): boolean => {
    const { horizontal: shape_horizontal, vertical: shape_vertical } = getLines(shape);
    const { horizontal: selection_horizontal, vertical: selection_vertical } = getLines(selection);

    return lineOverlaps(shape_horizontal, selection_horizontal, "x") && lineOverlaps(shape_vertical, selection_vertical, "y");
}

export const zoomCamera = (point: Point, camera: Camera, zoomOffset: number): Camera => {
    const zoom = camera.z - zoomOffset * camera.z;

    const p1 = viewportToGlobal(point, camera);
    const p2 = viewportToGlobal(point, { ...camera, z: zoom });

    return {
        x: camera.x + (p2.x - p1.x),
        y: camera.y + (p2.y - p1.y),
        z: zoom
    };
}