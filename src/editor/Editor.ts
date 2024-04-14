import { BabyTLCamera, BabyTLEvent } from "../types/editor-types";

interface BabyTLStore {
    atoms: Map<string, any>;
}

interface BabyTLEditorOptions {
    store: BabyTLStore;
    tools: string[];
}

// define the interface for the Editor class


export class Editor {
    readonly store: BabyTLStore;
    readonly tools: string[];

    testString = "something";
    cameraId = "main-camera";

    constructor({
        store,
        tools
    }: BabyTLEditorOptions) {
        this.store = store;
        this.tools = tools;
    }

    getCamera(): BabyTLCamera {
        return this.store.atoms.get(this.cameraId);
    }

    setCamera(camera: BabyTLCamera) {
        this.store.atoms.set(this.cameraId, camera);
    }

    getShapes() { }
    setShapes() { }

    getTestString(): string {
        return this.testString;
    }

    setTestString(input: string) {
        this.testString = input;
    }
}