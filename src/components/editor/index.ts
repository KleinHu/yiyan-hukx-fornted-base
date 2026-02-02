import { IDomEditor } from '@wangeditor/editor';
import Editor from './src/index.vue';

export interface EditorExpose {
  getEditorRef: () => Promise<IDomEditor>;
}

export { Editor };
