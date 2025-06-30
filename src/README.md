# /src Directory Structure

This directory contains the main source code for the project. Below is an overview of the structure and best practices:

## Structure

- `assets/` — Static assets (images, SVGs, etc.)
- `components/` — React components, organized by feature or type
- `context/` — React context providers and hooks
- `db_api/` — Database and API logic
- `hooks/` — Custom React hooks
- `lib/` — Utility/helper functions
- `pages/` — Page-level components
- `styles/` — CSS and style files
- `utils/` — Utility types, helpers, and constants

## Best Practices

- Place all custom hooks in `hooks/`.
- Place all CSS and style files in `styles/`.
- Organize components by feature or type in `components/`.
- Use clear, descriptive names for files and folders.
- Use import aliases (e.g., `@/hooks/useTodos`) for clarity.
- Keep code modular and easy to understand.

For more details, see the main project README. 