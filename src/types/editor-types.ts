export interface BabyTLCamera {
    x: number;
    y: number;
    z: number;
}

export interface BabyTLKey {
    key: string;
    direction: "up" | "down";
}

export interface BabyTLEvent {
    object: string;
    command: boolean | BabyTLCamera | string | BabyTLKey;
}

export interface Point {
    x: number,
    y: number
}

export interface Shape {
    type: string,
    x: number,
    y: number,
    width: number,
    height: number,
    tmpX?: number,
    tmpY?: number,
    selected: boolean
}

export type ShapeStore = {
    [key: string]: Shape;
};