# Arnote — Electron Meeting Transcription App

## Commands

- **Dev**: `pnpm dev` | **Build**: `pnpm build` | **Build macOS**: `pnpm build:mac`
- **Type check**: `pnpm typecheck` | **Lint**: `pnpm lint` | **Lint + fix**: `pnpm lint:fix` | **Format**: `pnpm format`

## Architecture

**Three Layers:** `Component → Hook → IPC → Main Process Service`

- **Components** render UI and call hooks
- **Hooks** manage state (Zustand) and IPC communication
- **IPC Handlers** bridge renderer ↔ main process
- **Main Process Services** handle audio capture, transcription, storage

## Stack

- **Runtime:** Electron 39 + React 19 + TypeScript 5.9
- **Bundler:** electron-vite
- **Styling:** Tailwind CSS 4 + shadcn/ui (new-york) + CVA
- **State:** Zustand (renderer) + electron-store (main process persistence)
- **Routing:** react-router-dom
- **Icons:** lucide-react
- **Package Manager:** pnpm

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts             # Entry — creates window, registers IPC
│   ├── audio/               # Audio capture services
│   ├── transcription/       # OpenAI Realtime API + summary
│   ├── storage/             # electron-store session persistence
│   └── ipc/                 # IPC handler registration
├── preload/                 # Context bridge (typed APIs)
└── renderer/src/
    ├── features/            # Feature modules (home, session, session-detail)
    ├── components/ui/       # shadcn/ui primitives
    ├── stores/              # Zustand stores
    ├── hooks/               # Shared hooks
    ├── types/               # Shared TypeScript types
    └── lib/                 # Utilities (cn, ipc wrapper)
```

## Component Folder Pattern (MANDATORY)

Every component MUST follow this structure:

```
ComponentName/
├── ComponentName.tsx        # Component implementation
├── types.ts                 # Props and local types (if needed)
└── index.ts                 # Barrel: export { ComponentName } from './ComponentName'
```

**Rules:**

- One component per folder
- File name === Component name (PascalCase)
- Barrel index.ts re-exports the component
- Feature barrels aggregate component exports
- **No component inside a component.** Each component lives in its own folder. Page sub-components go inside a `components/` folder within the page/feature directory:

```
features/session/
├── SessionPage.tsx
├── index.ts
└── components/
    ├── index.ts
    ├── TranscriptView/
    │   ├── TranscriptView.tsx
    │   └── index.ts
    └── MeetingControls/
        ├── MeetingControls.tsx
        ├── types.ts
        └── index.ts
```

### Barrel Exports

Every folder that contains a component MUST have an `index.ts` re-exporting its public API. Import from the folder, never from the file directly:

```typescript
// GOOD
import { MeetingControls } from './MeetingControls'
import { Button } from '@/components/ui/button'

// BAD
import { MeetingControls } from './MeetingControls/MeetingControls'
import { Button } from '@/components/ui/button/button'
```

## Feature Module Pattern

```
features/feature-name/
├── components/
│   ├── index.ts             # Barrel for all components
│   └── ComponentName/       # Component folders
├── hooks/
│   └── useFeatureHook.ts    # Feature-specific hooks
├── FeaturePage.tsx           # Page component
└── index.ts                 # Barrel: export page + public API
```

## Single Responsibility per File

Each file has one concern:

- `ComponentName.tsx` — React component only, no inline type declarations
- `types.ts` — props and local types for that component
- `index.ts` — barrel export only

## Types Separation

**Never** declare types or interfaces inside a component file.

- **Shared renderer types** → `src/renderer/src/types/` (e.g., `types/session.ts`)
- **Component props** → `ComponentName/types.ts` (e.g., `MeetingControls/types.ts`)
- **Main process types** → co-located with the service (e.g., `transcription/OpenAIRealtimeClient.ts`)
- Use `import type` for all type-only imports

## Constants Separation

**Never** inline magic values, label maps, or config objects in components or hooks.

- Extract to a `constants.ts` file co-located with the feature or service that owns them
- Import from the constants file wherever needed

```typescript
// BAD — magic string in component
<span className={status === 'completed' ? 'text-green-500' : 'text-gray-400'}>

// GOOD — constant in features/session/constants.ts
export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  completed: 'text-green-500',
  active: 'text-blue-500',
}
```

## Tree Pattern — Imports

Imports MUST be vertical (one per line) and grouped:

```typescript
// 1. React / external libraries
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Internal modules (absolute paths with @/)
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/stores/sessionStore'

// 3. Relative imports (same feature)
import { SessionCard } from './SessionCard'

// 4. Types
import type { Session } from '@/types/session'
```

## Code Style

- **TypeScript strict** — no `any`, no `@ts-ignore`
- **Named exports** only (no `export default`)
- **PascalCase** for components, **camelCase** for functions/variables
- **Single quotes**, no semicolons (enforced by Prettier)
- **Functional components** with explicit return types: `function Component(): React.JSX.Element`
- **Props** defined as interfaces in `types.ts` or inline for simple cases
- **No barrel pollution** — only export what's needed
- **No logic in components** — Components only render UI and call hooks. All event handlers, async operations, state management and data transformations live in dedicated hooks.

## DRY (Don't Repeat Yourself)

- Extract shared UI patterns into reusable components under `renderer/src/components/`
- Extract repeated data/IPC logic into custom hooks under `renderer/src/hooks/` or `features/<name>/hooks/`
- Use constants files for any label/color mapping used in more than one place

## IPC Rules

- All IPC channels defined as string constants
- Handlers registered in `src/main/ipc/` modules
- Renderer calls IPC through typed wrapper (`src/renderer/src/lib/ipc.ts`)
- Preload exposes typed API via `contextBridge`
- Channel naming: `domain:action` (e.g., `session:list`, `audio:start`)

## Main Process Rules

- Services are classes with clear responsibilities
- No direct `ipcMain` usage in services — handlers in `ipc/` folder
- electron-store for persistent data
- Async operations return Promises

## Styling

- **Tailwind CSS** for all styling — no CSS modules, no styled-components
- **shadcn/ui** for UI primitives (button, card, dialog, etc.)
- **CVA** (class-variance-authority) for component variants
- **cn()** helper from `@/lib/utils` for conditional classes
- **Dark mode** via `.dark` class on root — always pair light + dark classes:

```tsx
// GOOD — always pair light + dark
className = 'text-gray-900 dark:text-white'
className = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'

// BAD — missing dark mode variant
className = 'text-gray-900'
className = 'bg-blue-100 text-blue-800'
```

## Zustand Stores

```typescript
// Pattern for Zustand stores
import { create } from 'zustand'

interface StoreState {
  // state
  items: Item[]
  // actions
  addItem: (item: Item) => void
}

export const useStore = create<StoreState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] }))
}))
```

## Anti-Patterns

- **NO** `export default` — always use named exports
- **NO** `any` type — use `unknown` and narrow
- **NO** inline styles — use Tailwind classes
- **NO** direct `ipcRenderer` calls in components — use hooks + typed IPC wrapper
- **NO** business logic in components — extract to hooks or services
- **NO** magic strings for IPC channels — use constants
- **NO** circular imports between features
- **NO** relative imports crossing feature boundaries — use `@/` paths
- **NO** type declarations inside component files — use `types.ts`
- **NO** magic values or label maps inline in components — extract to `constants.ts`
- **NO** component definitions inside another component file — each in its own folder
- **NO** logic inline in components — event handlers, state management, async operations, data transformations and side effects must be abstracted into custom hooks

## Available Scripts

```bash
pnpm dev          # Start development with HMR
pnpm build        # Build the app
pnpm build:mac    # Build for macOS
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm format       # Format with Prettier
pnpm typecheck    # Check TypeScript types
```

## Key Paths

- Main process entry: `src/main/index.ts`
- Preload: `src/preload/index.ts`
- Renderer entry: `src/renderer/src/main.tsx`
- App component: `src/renderer/src/App.tsx`
- shadcn/ui config: `components.json`
- Vite config: `electron.vite.config.ts`
