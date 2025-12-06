---
"@wildneo/svelte-local-stash": patch
"@wildneo/react-local-stash": patch
"@wildneo/local-stash": patch
"@wildneo/emitter": patch
---

chore: add biome configuration and update package dependencies

- Introduced a new biome.json configuration file for project settings.
- Updated package.json to include @biomejs/biome and publint as dev dependencies.
- Adjusted pnpm-lock.yaml to reflect new package versions and dependencies.
- Modified tsconfig.json for improved TypeScript settings.
- Added vitest.config.ts for test configuration and removed the deprecated vitest.workspace.ts.
- Updated local-stash and emitter packages with new scripts for build and prepack processes.
- Added tests for the EventEmitter class in the emitter package.
