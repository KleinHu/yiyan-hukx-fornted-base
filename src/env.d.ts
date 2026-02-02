/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.svg' {
  const CONTENT: string;
  export default CONTENT;
}
declare module '*.svg?component' {
  import { FunctionalComponent, SVGAttributes } from 'vue';

  const src: FunctionalComponent<SVGAttributes>;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

// 解决找不到模块xxx或其相应的类型声明的问
declare module 'vue-clipboard3';
declare module 'splitpanes';
