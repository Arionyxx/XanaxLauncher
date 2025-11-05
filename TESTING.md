# Testing Guide

This document describes the testing infrastructure and how to run tests in this project.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses a comprehensive testing suite with:

- **Vitest** for unit and integration tests
- **Testing Library** for React component tests
- **MSW (Mock Service Worker)** for API mocking
- **Playwright** for E2E tests
- **fake-indexeddb** for IndexedDB mocking

### Test Types

1. **Unit Tests**: Test individual functions, classes, and utilities
2. **Integration Tests**: Test interactions between services and components
3. **Component Tests**: Test React components with user interactions
4. **E2E Tests**: Test complete user flows in the Electron app

## Running Tests

### Unit Tests

```bash
# Run all unit tests once
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (interactive mode)
npm run test:e2e:ui
```

### Running Specific Tests

```bash
# Run a specific test file
npx vitest packages/renderer/src/services/providers/utils/rate-limiter.test.ts

# Run tests matching a pattern
npx vitest --grep "RateLimiter"

# Run tests in a specific directory
npx vitest packages/renderer/src/services
```

## Test Structure

```
project/
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── e2e/                          # E2E tests
│   ├── electron-helpers.ts       # Electron test utilities
│   ├── onboarding.e2e.ts
│   └── settings.e2e.ts
└── packages/
    └── renderer/
        └── src/
            ├── test/                      # Test infrastructure
            │   ├── setup.ts               # Global test setup
            │   ├── mocks/                 # API mocks
            │   │   ├── server.ts          # MSW server setup
            │   │   ├── torbox.ts          # TorBox API mocks
            │   │   └── realdebrid.ts      # Real-Debrid API mocks
            │   ├── fixtures/              # Test data factories
            │   │   └── index.ts
            │   └── utils/                 # Test utilities
            │       └── test-utils.tsx
            └── services/
                └── providers/
                    └── utils/
                        ├── rate-limiter.ts
                        └── rate-limiter.test.ts  # Colocated test file
```

## Writing Tests

### Unit Tests

Unit tests should be colocated with the source files they test:

```typescript
// rate-limiter.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from './rate-limiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should acquire token when available', () => {
    const limiter = new RateLimiter({ requestsPerSecond: 2 })
    expect(limiter.tryAcquire()).toBe(true)
  })
})
```

### Component Tests

Use Testing Library for component tests:

```typescript
import { render, screen, fireEvent } from '@/test/utils/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should handle button click', () => {
    render(<MyComponent />)

    const button = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(button)

    expect(screen.getByText(/success/i)).toBeInTheDocument()
  })
})
```

### Testing with MSW

MSW handlers are automatically loaded in test setup:

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('API integration', () => {
  it('should handle API errors', async () => {
    // Override specific handler for this test
    server.use(
      http.get('/api/endpoint', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    // Test your code that calls the API
  })
})
```

### Testing with IndexedDB

Tests use fake-indexeddb automatically:

```typescript
import { db } from '@/db'

describe('Database operations', () => {
  beforeEach(async () => {
    await db.settings.clear()
  })

  it('should save settings', async () => {
    await db.settings.put({ key: 'app_settings', value: { theme: 'dark' } })
    const result = await db.settings.get('app_settings')
    expect(result?.value.theme).toBe('dark')
  })
})
```

### E2E Tests

E2E tests use Playwright to test the full Electron app:

```typescript
import { test, expect } from '@playwright/test'
import { launchElectronApp, closeElectronApp } from './electron-helpers'

test('should complete user flow', async () => {
  const { app, page } = await launchElectronApp()

  try {
    await page.getByRole('button', { name: /start/i }).click()
    await expect(page.getByText(/success/i)).toBeVisible()
  } finally {
    await closeElectronApp(app)
  }
})
```

## Coverage Requirements

The project enforces minimum coverage thresholds:

- **Lines**: 60%
- **Functions**: 60%
- **Branches**: 60%
- **Statements**: 60%

### Coverage Exclusions

The following are excluded from coverage:

- Type definition files (`*.d.ts`)
- Configuration files (`*.config.ts`)
- Test files (`*.test.ts`, `*.spec.ts`)
- Test infrastructure (`test/`, `tests/`)
- Next.js pages (`packages/renderer/src/app/`)
- Electron main process entry (`packages/main/src/index.ts`, `preload.ts`)

### Viewing Coverage

After running `npm run test:coverage`, open the HTML report:

```bash
open coverage/index.html
```

## CI/CD

### GitHub Actions

The CI pipeline runs on every push and pull request:

1. **Lint**: ESLint and Prettier checks
2. **Type Check**: TypeScript compilation (Node 18, 20)
3. **Unit Tests**: Vitest with coverage (Node 18, 20)
4. **E2E Tests**: Playwright tests
5. **Build**: Build for Ubuntu, macOS, Windows

### CI-Specific Behavior

- E2E tests run in headless mode
- Coverage reports are uploaded as artifacts
- Test failures upload screenshots and videos
- Coverage thresholds must pass

## Test Best Practices

### DO

✅ Write descriptive test names that explain what is being tested
✅ Use `describe` blocks to organize related tests
✅ Use `beforeEach` for test setup to ensure isolation
✅ Test behavior, not implementation details
✅ Use Testing Library queries (`getByRole`, `getByText`) over manual selectors
✅ Mock external dependencies (APIs, filesystem, etc.)
✅ Test error cases and edge cases
✅ Keep tests focused on a single concern

### DON'T

❌ Test third-party library internals
❌ Write tests that depend on each other
❌ Use `sleep()` or arbitrary timeouts (use `waitFor` instead)
❌ Test private methods directly
❌ Aim for 100% coverage (focus on valuable tests)
❌ Mock everything (test real integrations where possible)
❌ Skip cleanup in `afterEach`

## Troubleshooting

### Tests Timing Out

If tests are timing out, check:

1. Are you using fake timers? (`vi.useFakeTimers()`)
2. Did you advance timers? (`vi.advanceTimersByTime()`)
3. Are async operations properly awaited?
4. Is the test cleanup running? (`afterEach`)

### MSW Not Working

If API mocks aren't intercepting requests:

1. Check that the URL matches exactly (including query params)
2. Verify the handler is registered in `server.ts`
3. Check the console for MSW warnings
4. Ensure `server.listen()` is called in test setup

### E2E Tests Flaky

If E2E tests are flaky:

1. Use proper waiting strategies (`waitForLoadState`, `waitForSelector`)
2. Avoid hard-coded timeouts
3. Check for race conditions
4. Ensure proper cleanup between tests
5. Use `test.describe.serial` for dependent tests

### Coverage Not Generated

If coverage isn't being generated:

1. Check that you're using `npm run test:coverage`
2. Verify `vitest.config.ts` has coverage configuration
3. Check for syntax errors in source files
4. Ensure coverage provider is installed (`@vitest/coverage-v8`)

## Security Testing

The test suite includes security regression tests:

- **URL Sanitization**: Prevents XSS attacks
- **API Token Storage**: Ensures tokens never leak to renderer storage
- **IPC Validation**: Rejects malformed payloads
- **CSP Enforcement**: Content Security Policy is properly configured

Run security tests specifically:

```bash
npx vitest --grep "security"
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
