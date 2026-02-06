# Chancellor Dossier

*Gather 'round, political schemers...*

Tired of fumbling with those tiny envelopes? Sick of accidentally revealing your secret identity when someone's cat decides the membership cards look delicious? Fear not! **Chancellor Dossier** is here to save your clandestine political machinations.

This digital companion app for **Secret Hitler** replaces those pesky physical envelopes with sleek, digital party cards and membership reveals. No more lost cards, no more bent envelopes, no more "wait, which one was mine again?" Just pure, unadulterated political intrigue at your fingertips.

*Now, shall we begin the vote?*

## Tech Stack

- **React 19** - Modern UI library with React Compiler
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Vitest** - Unit testing
- **Playwright** - End-to-end testing

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Testing

#### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run tests in UI mode
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

#### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug

# Show last test report
pnpm test:e2e:report
```

### Linting

```bash
pnpm lint
```

## Project Structure

```
src/
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
├── types/           # TypeScript type declarations
├── app.tsx          # Main application component
├── main.tsx         # Application entry point
└── index.css        # Global styles and Tailwind configuration

tests/
└── e2e/             # End-to-end tests (Playwright)
```

## Testing

This project uses two testing frameworks:

### Unit Testing (Vitest + React Testing Library)

Unit tests are located next to the files they test with the `.test.ts` or `.test.tsx` extension.

Features:
- **Vite-native**: Fast test execution with Vite's transform pipeline
- **UI Mode**: Interactive test runner with `pnpm test:ui`
- **Coverage**: Built-in coverage with v8
- **Watch Mode**: Automatic re-run on file changes

Example test files:
- `src/lib/utils.test.ts` - Unit tests for utility functions
- `src/app.test.tsx` - Component tests for the App component

### End-to-End Testing (Playwright)

E2E tests are located in the `tests/e2e/` directory with the `.spec.ts` extension.

Features:
- **Browser**: Chromium only (configurable in `playwright.config.ts`)
- **Auto-start dev server**: Tests automatically start the Vite dev server
- **UI Mode**: Interactive test runner with `pnpm test:e2e:ui`
- **Debug Mode**: Step-through debugging with `pnpm test:e2e:debug`
- **Screenshots**: Captured on test failures
- **Trace Viewer**: Available for failed tests

Example test files:
- `tests/e2e/app.spec.ts` - E2E tests for the main application

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
