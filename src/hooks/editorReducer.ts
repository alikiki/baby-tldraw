import { Editor } from "../editor/Editor";

interface EditorAction {
  action: string;
  input: string;
}

export function editorReducer(editor: any, action: EditorAction) {
  let newEditor = new Editor({ store: editor.store, tools: editor.tools });
  if (action.action === "test") {
    newEditor = newEditor.setTestString(action.input);
  }
  return newEditor;
}