# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EdgeChatWebUI is a browser-based AI agent and workflow orchestration platform that runs entirely on the client side using Transformers.js and WebGPU. It's built with Vue 3, Vite, TypeScript, and Naive UI.

## Development Commands

### Package Manager

This project uses **Bun** as the package manager (requires >= 1.3.7).

### Common Commands

- `bun dev` - Start development server (runs on port 9527)
- `bun dev:prod` - Start dev server in production mode
- `bun build` - Build for production
- `bun build:test` - Build for test environment
- `bun preview` - Preview production build (port 9725)
- `bun lint` - Run linters (oxlint + eslint with auto-fix)
- `bun fmt` - Format code with oxfmt
- `bun typecheck` - Run TypeScript type checking
- `bun gen-route` - Generate routes using elegant-router
- `bun commit` - Interactive commit (English)
- `bun commit:zh` - Interactive commit (Chinese)

### Git Hooks

Pre-commit hooks automatically run: `typecheck`, `lint`, `fmt`, and check for uncommitted changes.

## Architecture

### Monorepo Structure

The project uses Bun workspaces with packages in `packages/`:

- `@ecw/database` - SurrealDB integration for local storage
- `@ecw/transformers` - Transformers.js wrapper for AI model inference
- `@sa/hooks` - Vue composition hooks
- `@sa/scripts` - Build and utility scripts
- `@sa/utils` - General utilities

### Routing System

Uses **Elegant Router** (`@elegant-router/vue`) for automatic route generation:

- Route files in `src/views/` are automatically converted to routes
- Layouts defined in `src/layouts/` (base-layout, blank-layout)
- Generated routes in `src/router/elegant/routes.ts` and `src/router/elegant/imports.ts`
- Route metadata configured in: `build/plugins/router.ts`
- To add routes: create Vue files in `src/views/` matching the pattern, then run `bun gen-route`

### State Management

Uses **Pinia** with stores in `src/store/modules/`:

- `app` - Global app state (locale, mobile detection, UI state)
- `route` - Route management and menu generation
- `tab` - Tab management
- `theme` - Theme and layout settings

### Internationalization

Uses **vue-i18n** with:

- Locale files in `src/locales/langs/` (zh-cn.ts, en-us.ts)
- Use `$t()` function for translations, import from `@/locales`

### Storage

Uses local storage utilities from `@sa/utils`:

- `localStg` - Local storage with prefix
- `sessionStg` - Session storage

### Styling

- **UnoCSS** - Utility-first CSS (config: `uno.config.ts`)
- **SCSS**`- Global styles in`src/styles/scss/`
- **Naive UI** - Component library with theme system

### Type System

- TypeScript with project references (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.nerd.json`)
- Type definitions in `src/types/`
- Global type declarations in `src/types/global.d.ts`

### Build System

Vite plugins configured in `build/plugins/`:

- `router.ts` - Elegant Router setup
- `unocss.ts` - UnoCSS configuration
- `unplugin.ts` - Auto-imports and component resolution

## Key Directories

- `src/components/` - Reusable components (custom, common, advanced)
- `src/layouts/` - Layout components (base-layout, blank-layout)
- `src/views/` - Page components (home, \_builtin for system pages)
- `src/router/` - Router configuration and guards
- `src/store/` - Pinia stores
- `src/hooks/` - Custom Vue composition hooks
- `src/utils/` - Utility functions
- `src/locales/` - i18n configuration
- `src/plugins/` - Vue plugins setup
- `build/` - Build configuration and plugins
- `packages/` - Workspace packages

## Important Notes

- The project uses a setup wizard (`src/views/_builtin/wizard/`) for first-time initialization
- Uses `@surrealdb/wasm` for local database storage
- AI model inference runs in Web Workers for non-blocking UI
- Supports both light and dark themes with Naive UI
