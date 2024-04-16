export interface Editor {
    initialCamera: { x: number, y: number };
    camera: { x: number, y: number };
    isPointerDown: boolean;
    isPointerDragging: boolean;
}
