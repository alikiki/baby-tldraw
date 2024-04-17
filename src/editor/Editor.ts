export interface Editor {
    initialCamera: { x: number, y: number, z: number };
    camera: { x: number, y: number, z: number };
    isPointerDown: boolean;
    isPointerDragging: boolean;
    isMetaDown: boolean;
}
