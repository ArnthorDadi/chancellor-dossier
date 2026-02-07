# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in the chancellor-dossier repository.

## Project Overview

React + TypeScript + Vite application with React Compiler enabled, using Tailwind CSS and shadcn/ui components. This project uses strict TypeScript configuration, ESLint for code quality enforcement, and comprehensive testing setup with Vitest and Playwright.

### Technology Stack
- React 19.2.0 with TypeScript
- Vite 7.2.4 as build tool
- React Compiler (babel-plugin-react-compiler) enabled
- Tailwind CSS 4.1.18 for styling
- shadcn/ui component library with Radix UI primitives
- Vitest 4.0.17 for unit testing with React Testing Library
- Playwright 1.57.0 for end-to-end testing
- ESLint with TypeScript, React Hooks, and React Refresh rules
- Strict TypeScript mode with comprehensive linting

## Game Rules Reference

### Game Logic (The Math)
- 5 players: 3 Liberal, 1 Fascist, 1 Hitler
- 6 players: 4 Liberal, 1 Fascist, 1 Hitler
- 7 players: 4 Liberal, 2 Fascist, 1 Hitler
- 8 players: 5 Liberal, 2 Fascist, 1 Hitler
- 9 players: 5 Liberal, 3 Fascist, 1 Hitler
- 10 players: 6 Liberal, 3 Fascist, 1 Hitler

### Knowledge Rules
- Less than 7 Players: Hitler knows who the Fascist(s) are.
- More or equal to 7 Players: Hitler is blind to Fascist identity. Fascists know Hitler and each other.

### Security & Privacy Implementation
- NEVER expose 'role' property in Investigation power UI
- Investigation power ONLY reveals 'party' (Liberal or Fascist)
- Hitler's 'party' is ALWAYS Fascist (never Liberal)

## Development Commands

### Core Commands
```bash
npm run dev              # Start development server with HMR
npm run build            # TypeScript compilation + Vite build
npm run lint             # Run ESLint on entire project
npm run preview          # Preview production build locally
```

### Testing Commands
```bash
npm run test             # Run unit tests with Vitest
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Generate test coverage report
npm run test:e2e         # Run Playwright end-to-end tests
npm run test:e2e:ui      # Run E2E tests with Playwright UI
npm run test:e2e:debug   # Debug E2E tests
npm run test:e2e:report  # Show Playwright test report
```

### TypeScript Compilation
```bash
tsc -b                   # Build TypeScript (used in npm run build)
tsc -b --watch           # Watch TypeScript compilation
```

### Development Workflow
1. Always run `npm run lint` before committing changes
2. Use `npm run dev` for development with hot module replacement
3. Run `npm run build` to verify production build works
4. Run `npm run test` for unit tests during development
5. Use `npm run test:e2e` for full end-to-end testing

## Rules for AI Agent

- You have permission to run `npm test` and `npm run build`.
- You may create new files in the `/src` and `/tests` directories.
- **Do not** modify `.env` files or any credentials.
- **Do not** read `.env` files or use their content in any code you create.
- Use `ls -R` to explore the directory structure if you get lost.

## Code Style Guidelines

### Import Organization
```typescript
// External libraries first
import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

// Internal modules second (using @ alias)
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import App from '@/app'
```

### Component Conventions
- Use functional components with hooks
- Export default for main components
- Use PascalCase for component names
- Props interfaces should be prefixed with component name
- Leverage shadcn/ui patterns and Tailwind CSS classes

### File Naming Conventions
- **Format**: `<name>-<second>.*` (e.g., `app.tsx`, `button.tsx`, `input.tsx`, `use-auth.ts`, `auth-form.tsx`)
- **Components**: PascalCase (e.g., `UserProfile.tsx`, `DigitalEnvelope.tsx`)
- **Hooks**: camelCase (e.g., `useUserData.ts`, `useRoomState.ts`)
- **Utils**: camelCase (e.g., `apiHelpers.ts`, `validationRules.ts`)
- **Types**: camelCase (e.g., `userTypes.ts`, `gameTypes.ts`)
- **Tests**: `<ComponentName>.test.tsx` or `<ComponentName>.test.ts`

```typescript
// Good naming examples (following <name>-<second>.* format)
src/
├── app.tsx                 // Main app component
├── components/
│   ├── ui/
│   │   ├── button.tsx       // UI component
│   │   ├── input.tsx        // UI component  
│   │   └── noir-card.tsx    // Custom component
│   ├── auth-form.tsx        // Feature component
│   ├── auth-form.test.tsx   // Component test
│   ├── UserProfile.tsx        // Feature component
│   └── DigitalEnvelope.tsx   // Custom component
├── hooks/
│   ├── use-auth.ts          // Custom hook
│   ├── use-auth.test.ts      // Hook test
│   ├── useUserData.ts         // Custom hook
│   └── useRoomState.ts      // Custom hook
├── lib/
│   ├── utils.ts             // Utility functions
│   ├── firebase-config.ts     // Firebase configuration
│   └── apiHelpers.ts       // API helpers
└── types/
    ├── userTypes.ts          // Type definitions
    └── gameTypes.ts         // Type definitions

// Test files (following <name>-<second>.* format)
src/
├── components/
│   ├── ui/
│   │   ├── button.test.tsx   // Component test
│   │   └── input.test.tsx    // Component test
│   ├── auth-form.test.tsx   // Component test
│   ├── UserProfile.test.tsx   // Feature component test
│   └── DigitalEnvelope.test.tsx
```

```typescript
interface AppProps {
  title: string
}

function App({ title }: AppProps) {
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  )
}

export default App
```

### TypeScript Patterns
- Use strict mode (already configured)
- Prefer `interface` for object shapes, `type` for unions/generics
- Use explicit return types for functions
- Leverage type inference where appropriate
- Use `@/*` path aliases for clean imports

```typescript
// Good
interface User {
  id: number
  name: string
}

const fetchUser = async (id: number): Promise<User> => {
  // implementation
}

// Avoid unused parameters and locals (enforced by tsconfig)
```

## React-Specific Conventions

### React Compiler Considerations
- React Compiler is enabled via babel-plugin-react-compiler
- Write components as if they could be optimized automatically
- Avoid manual optimizations that might interfere with compiler

### Hooks Usage
```typescript
// Standard hooks pattern
const [count, setCount] = useState(0)
const [data, setData] = useState<Data | null>(null)

useEffect(() => {
  // Effect logic
}, [dependency])
```

### JSX Patterns with Tailwind CSS
- Use Tailwind CSS classes for styling
- Leverage shadcn/ui components for consistent UI
- Use self-closing tags for empty elements
- Prefer fragments over unnecessary divs
- Follow existing indentation and formatting

```typescript
return (
  <div className="flex min-h-screen items-center justify-center">
    <Button variant="outline">Click me</Button>
  </div>
)
```

### Component Library Usage
- Use shadcn/ui components from `@/components/ui`
- Follow shadcn/ui patterns for variants and styling
- Use `cn()` utility for conditional class merging
- Leverage Radix UI primitives through shadcn/ui

```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CustomButton = ({ variant, className, ...props }) => (
  <Button className={cn("custom-styles", className)} variant={variant} {...props} />
)
```

## TypeScript Best Practices

### Strict Mode Requirements
- All variables must be explicitly typed or inferred
- No unused locals or parameters (enforced)
- No implicit any types
- Strict null checking enabled

### Type Definitions
```typescript
// Interface for object shapes
interface ApiResponse {
  data: string[]
  status: number
}

// Type for unions/generics
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

type Result<T> = {
  success: boolean
  data?: T
  error?: string
}
```

### Path Aliases
- Use `@/*` aliases configured in tsconfig.json and vite.config.ts
- `@/components` for React components
- `@/lib` for utility functions
- `@/hooks` for custom React hooks
- `@/components/ui` for shadcn/ui components

## File Organization

### Directory Structure
```
src/
├── components/         # Reusable UI components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and helpers
├── app.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global Tailwind CSS styles

tests/
├── e2e/               # Playwright end-to-end tests
└── fixtures/          # Test fixtures and data

coverage/               # Test coverage reports
```

### Asset Imports
```typescript
// CSS and Tailwind
import '@/index.css'

// Components with aliases
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## Testing Guidelines

### Unit Testing (Vitest + React Testing Library)
- Test files: `*.test.tsx` or `*.test.ts`
- Use React Testing Library for component testing
- Use jsdom environment for DOM testing
- Test user interactions and component behavior

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### End-to-End Testing (Playwright)
- Test files: `tests/e2e/*.spec.ts`
- Test full user workflows and application behavior
- Use Playwright test runner with browser automation
- Configure in playwright.config.ts

```typescript
import { test, expect } from '@playwright/test'

test('home page loads correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Chancellor Dossier')).toBeVisible()
})
```

### Test Commands
```bash
npm run test                # Run all unit tests
npm run test:ui            # Run tests with UI interface
npm run test:coverage      # Generate coverage report
npm run test:e2e           # Run E2E tests
npm run test:e2e:ui        # Run E2E tests with UI
```

## UI Design System

For comprehensive UI styling guidelines, theme implementation, and component patterns, see [UI_STYLING.md](./docs/UI_STYLING.md).

## Styling Guidelines

### Tailwind CSS Usage
- Use Tailwind CSS classes for all styling
- Leverage Tailwind's responsive design prefixes
- Use dark mode variants where appropriate
- Follow Tailwind's default spacing and color scales

```typescript
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Dark mode support
<div className="bg-slate-50 dark:bg-slate-900">

// Spacing and typography
<h1 className="text-4xl font-bold p-6">
```

### shadcn/ui Component Patterns
- Use shadcn/ui components as building blocks
- Follow shadcn/ui variant patterns
- Use `cn()` utility for conditional styling
- Extend components with custom variants when needed

```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CustomButton = ({ className, ...props }) => (
  <Button className={cn("additional-styles", className)} {...props} />
)
```

## 1930s Noir Styling System

### Theme Overview
- **Aesthetic**: 1930s Noir / Bureaucratic Minimalist
- **Primary Colors**: Liberal Blue (#2b5d84), Fascist Red (#9c2a2a), Hitler Brown (#4d342c)
- **Background**: Parchment (#f4e4bc) with aged paper textures
- **Typography**: Special Elite (headers), Courier Prime (body)

### Noir Color Usage Guidelines
```typescript
// Role-specific styling
const roleColors = {
  liberal: 'bg-liberal-blue text-white border-2 border-noir-black',
  fascist: 'bg-fascist-red text-white border-2 border-noir-black', 
  hitler: 'bg-hitler-brown text-white border-2 border-noir-black'
}

// Envelope styling
const envelopeStyles = 'border-2 border-liberal-blue bg-parchment rounded-lg shadow-lg'
```

### Typography Patterns
```typescript
// Bureaucratic headers
<h1 className="font-special-elite text-2xl text-liberal-blue">SECRET DOSSIER</h1>

// Form content
<p className="font-courier text-sm aged-paper">Top Secret - For Internal Use Only</p>
```

### Component Noir Variants
- Extend shadcn/ui components with noir-specific variants
- Use `cn()` utility for conditional noir styling
- Maintain accessibility with proper contrast ratios

### Implementation Requirements
- All components must use noir color palette
- Typography must use period-appropriate fonts
- Maintain mobile-first responsive design
- Preserve dark mode support with noir-appropriate variants

## Linting and Code Quality

### ESLint Configuration
- TypeScript ESLint rules enabled
- React Hooks rules enforced
- React Refresh for Vite compatibility
- Global ignores: dist/, coverage/, node_modules/

### Before Committing
1. Run `npm run lint` to check for ESLint violations
2. Run `npm run build` to verify TypeScript compilation
3. Run `npm run test` to ensure tests pass
4. Test in development mode with `npm run dev`

### Common Issues to Avoid
- Unused variables (enforced by TypeScript)
- Missing dependencies in useEffect arrays
- Implicit any types
- Missing return types on exported functions
- Incorrect Tailwind class usage

## Development Tips

### Performance Considerations
- React Compiler will optimize components automatically
- Focus on clean, readable code over manual optimizations
- Use React.memo only when necessary for specific cases
- Leverage Tailwind CSS's purging for production builds

### Debugging
- Use browser DevTools for React component inspection
- Console logging is acceptable for development debugging
- Remove or comment out debug logs before committing
- Use Vitest debugger for unit test issues

### Component Development
- Start with shadcn/ui components when possible
- Use Tailwind CSS for custom styling
- Test components with React Testing Library
- Ensure responsive design with Tailwind prefixes

### Code Review Checklist
- [ ] All imports organized correctly with @ aliases
- [ ] TypeScript types are explicit and appropriate
- [ ] Components follow shadcn/ui and Tailwind patterns
- [ ] **Noir styling uses correct color palette (liberal-blue, fascist-red, hitler-brown)**
- [ ] **Typography uses period-appropriate fonts (Special Elite, Courier Prime)**
- [ ] **Components implement noir variants with proper border styling**
- [ ] **Mobile touch targets meet 44x44px minimum with noir styling**
- [ ] **Dark mode variants maintain noir aesthetic**
- [ ] No ESLint violations
- [ ] Build completes successfully
- [ ] Tests pass (unit and E2E when applicable)
- [ ] Code is self-documenting with clear naming
- [ ] Tailwind classes use noir color variables
- [ ] Components are properly exported
