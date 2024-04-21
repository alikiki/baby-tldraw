import { Point, Camera } from "../types/editor-types"

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

export const intersects = (shape: Shape, selection: Shape): boolean => {
    const p1 = { x: shape.x, y: shape.y };
    const p2 = { x: shape.x + shape.width, y: shape.y };
    const p3 = { x: shape.x, y: shape.y + shape.height };
    const p4 = { x: shape.x + shape.width, y: shape.y + shape.height };

    return isInside(p1, selection) || isInside(p2, selection) || isInside(p3, selection) || isInside(p4, selection);
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