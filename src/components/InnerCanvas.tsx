export default function InnerCanvas({ camera }) {

    const convertCameraToTranslation = (camera: { x: number, y: number, z: number }) => {
        return `scale(${camera.z}) translate(${camera.x}px, ${camera.y}px)`
    }

    return (
        <svg>
            <defs>
                <rect id="box" x="100" y="100" height="100" width="100" />
            </defs>
            <g style={{ transform: convertCameraToTranslation(camera) }}>
                {Array.from(Array(100)).map((_, i) => (
                    <use
                        key={i}
                        href="#box"
                        x={(i % 10) * 200}
                        y={Math.floor(i / 10) * 200}
                    />
                ))}
            </g>
        </svg>
    )
}