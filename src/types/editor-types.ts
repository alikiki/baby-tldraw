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