
/// <reference types="node" />

// Fix: Removed the vite/client reference to resolve the type definition error.
// The necessary ImportMeta and NodeJS types are manually declared below to support API key access.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
