import { useEditor } from "../hooks/useEditor";

export default function InnerCanvas() {
    const editor = useEditor();

    return (
        <div style={{ transform: `scale(${editor.camera.z}) translate(${editor.camera.x}px, ${editor.camera.y}px)` }}>
            {Array.from({ length: 10 }, (_, row) => {
                return Array.from({ length: 10 }, (_, i) => {
                    return (< div key={i}
                        style={{
                            position: "absolute",
                            top: (12 * row),
                            left: (12 * i),
                            width: 10,
                            height: 10,
                            backgroundColor: "red" // Changed to red
                        }}>
                    </div>)
                })
            })}

            {/* <div style={{ position: "absolute", top: 0, left: 0, width: 100, height: 100, backgroundColor: "red" }}></div>
            <div style={{ position: "absolute", top: 0, left: 105, width: 100, height: 100, backgroundColor: "red" }}></div> */}
        </div >
    )
}