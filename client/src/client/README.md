# Client

## Purpose
Client contains **client-side orchestration** for UI: state hooks and client functions that call Server Actions.

## Sub-layers
- `src/client/state`: hooks that UI components consume.
- `src/client/actions`: client functions that call `src/actions` (Server Actions).

## Rules
- Components should not contain logic beyond rendering; they should use hooks from `src/client/state`.
- Client-side actions should be thin wrappers over Server Actions.

