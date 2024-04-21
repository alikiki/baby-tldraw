import { useEditor } from "../hooks/useEditor";

export default function InnerCanvas() {
    const editor = useEditor();

    return (
        <div style={{ position: "relative", width: "800px", height: "600px", border: "1px solid blue", transform: `scale(${editor.camera.z}) translate(${editor.camera.x}px, ${editor.camera.y}px)` }}>

            {/* <div style={{ position: "absolute", top: 0, left: 0, width: 100, height: 100, backgroundColor: "red" }}></div>
            <div style={{ position: "absolute", top: 0, left: 105, width: 100, height: 100, backgroundColor: "red" }}></div> */}
        </div >
    )
}