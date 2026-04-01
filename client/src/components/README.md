# Components

## Purpose
Components are **UI-only** building blocks.

## Responsibilities
- Render UI given props/state provided by hooks.
- Delegate all data fetching/mutations and business logic to `src/client/state`.

## Rules
- No business logic in components.
- Prefer calling a hook from `src/client/state` and rendering its returned data/handlers.
- Keep components focused on composition, accessibility, and presentation.

