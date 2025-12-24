// Removed the reference to 'node' types as it was causing a build error in the browser environment.
// The necessary ImportMeta types are declared here to support API key access.

export {};

// Using declare global allows us to augment the global scope correctly in a module context.
declare global {
  // Fix: Removed 'var process' declaration to avoid "Cannot redeclare block-scoped variable 'process'" 
  // errors when conflicts occur with other type definitions or imports in the project.
  // We rely on the environment's existing process type or Vite's substitution.

  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
