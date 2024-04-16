export interface BabyTLCamera {
    x: number;
    y: number;
}

export interface BabyTLEvent {
    object: string;
    command: BabyTLCamera | string;
}