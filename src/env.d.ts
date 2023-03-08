/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEV_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
