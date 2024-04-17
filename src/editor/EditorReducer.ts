import { Editor } from "./Editor";
import { BabyTLEvent } from "../types/editor-types";

export function EditorReducer(editor: Editor, action: BabyTLEvent) {
    console.log(`received: ${JSON.stringify(action)}`)
    if (action.object === "camera") {
        return {
            ...editor,
            camera: {
                x: action.command.x,
                y: action.command.y,
                z: action.command.z
            }
        }
    } else if (action.object === "initial-camera") {
        return {
            ...editor,
            initialCamera: {
                x: action.command.x,
                y: action.command.y,
                z: action.command.z
            }
        }

    } else if (action.object === "pointer") {
        if (action.command === "down") {
            return {
                ...editor,
                isPointerDown: true
            }
        } else if (action.command === "up") {
            return {
                ...editor,
                isPointerDown: false,
                isPointerDragging: false
            }
        } else if (action.command === "drag") {
            return {
                ...editor,
                isPointerDragging: true
            }
        }
    } else if (action.object === "keyboard") {
        if (action.command.key === "meta") {
            if (action.command.direction === "down") {
                return {
                    ...editor,
                    isMetaDown: true
                }
            } else if (action.command.direction === "up") {
                return {
                    ...editor,
                    isMetaDown: false
                }
            }
        }
    }
}