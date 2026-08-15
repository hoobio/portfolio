declare module '*.css';
declare module '*.svg';

// Hand-declared rather than referencing vite/client: tsconfig.app.json sets
// "types": [] and vite/client re-declares *.svg, which collides with above.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
