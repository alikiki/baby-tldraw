import { BabyTLCamera } from "../types/editor-types"
import { Shape, ShapeStore } from "../types/editor-types"

interface InnerCanvasProps {
    camera: BabyTLCamera,
    shapes: ShapeStore,
    selectionBox: Shape | null
}

export default function InnerCanvas({ camera, shapes, selectionBox }: InnerCanvasProps) {

    const convertCameraToTranslation = (camera: { x: number, y: number, z: number }) => {
        return `scale(${camera.z}) translate(${camera.x}px, ${camera.y}px)`
    }

    const generateSVGPath = (shape: Shape) => {
        const path = `M ${shape.x} ${shape.y} h ${shape.width} v ${shape.height} h -${shape.width} Z`

        const style = {
            stroke: shape.selected ? 'blue' : 'black',
            strokeWidth: shape.selected ? `${3 / camera.z}` : '2',
            fill: 'lightgray',
        };

        return { path, style };
    }

    return (
        <svg>
            <defs>
                <rect id="box" x="100" y="100" height="100" width="100" />
            </defs>
            <g style={{ transform: convertCameraToTranslation(camera) }}>
                {Object.entries(shapes).map(([k, shape]) => {
                    const { path, style } = generateSVGPath(shape);
                    return <path key={k} d={path} style={style} />
                })}
                {selectionBox && <path d={generateSVGPath(selectionBox).path} style={{ fill: "lightblue", fillOpacity: "0.4" }} />}
            </g>
        </svg>
    )
}