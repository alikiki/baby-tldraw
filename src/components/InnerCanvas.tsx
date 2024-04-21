import { BabyTLCamera } from "../types/editor-types"

interface Shape {
    id: string,
    type: string,
    x: number,
    y: number,
    width: number,
    height: number
}

interface InnerCanvasProps {
    camera: BabyTLCamera,
    shapes: ShapeStore
}

type ShapeStore = {
    [key: string]: Shape;
};

export default function InnerCanvas({ camera, shapes }: InnerCanvasProps) {

    const convertCameraToTranslation = (camera: { x: number, y: number, z: number }) => {
        return `scale(${camera.z}) translate(${camera.x}px, ${camera.y}px)`
    }

    const generateSVGPath = (shape: Shape) => {
        return `M ${shape.x} ${shape.y} h ${shape.width} v ${shape.height} h -${shape.width} Z`
    }

    return (
        <svg>
            <defs>
                <rect id="box" x="100" y="100" height="100" width="100" />
            </defs>
            <g style={{ transform: convertCameraToTranslation(camera) }}>
                {Object.entries(shapes).map(([k, shape]) => (
                    <path key={k} d={generateSVGPath(shape)} />
                ))}
            </g>
        </svg>
    )
}