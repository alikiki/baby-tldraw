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