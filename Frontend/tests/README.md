# Frontend Unit Tests

This directory contains unit tests for the InvoiceRWA frontend modules.

## Test Files

| File | Description |
|------|-------------|
| `notification.test.js` | Tests for the notification system (success, error, info, warning) |
| `store.test.js` | Tests for the state management store (AppState) |
| `sanitizer.test.js` | Tests for input sanitization utilities (XSS prevention) |

## Running Tests

### Using Jest

```bash
# Install dependencies
npm install --save-dev jest @jest/globals

# Run all tests
npm test

# Run specific test file
npm test notification.test.js

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Using Vitest

```bash
# Install dependencies
npm install --save-dev vitest

# Run all tests
npx vitest

# Run tests with UI
npx vitest --ui

# Run tests with coverage
npx vitest --coverage
```

### Using Node.js directly

```bash
# Install test dependencies
npm install --save-dev mocha chai

# Run tests
npx mocha tests/*.test.js
```

## Test Coverage

The test suite covers:

### Notification System
- Show notification with different types (success, error, info, warning)
- Custom duration options
- Auto-dismiss functionality
- XSS prevention (HTML escaping)
- Global `window.notification` API

### Store (State Management)
- State retrieval (`getState()`)
- State updates (`setState()`)
- Subscription/listener pattern
- Convenience methods (`setUser`, `setInvoices`, etc.)
- localStorage persistence

### Sanitizer
- HTML escaping (`escapeHtml()`)
- URL sanitization (`sanitizeUrl()`)
- Suspicious content detection (`isSuspicious()`)
- XSS prevention patterns
- File upload validation

## Adding New Tests

When adding new functionality, follow this pattern:

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('methodUnderTest()', () => {
    test('should do something expected', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = methodUnderTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Test Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive names**: Test names should describe what is being tested
3. **One assertion per test**: Keep tests focused
4. **Mock external dependencies**: Use mocks for DOM, localStorage, etc.
5. **Test edge cases**: Empty strings, null, undefined, etc.
6. **Test error conditions**: Ensure errors are handled properly

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Coverage Goals

- **Lines**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Statements**: > 80%

## Current Status

- [x] notification.test.js - Complete
- [x] store.test.js - Complete
- [x] sanitizer.test.js - Complete
- [ ] main.test.js - Pending
- [ ] api-client.test.js - Pending
- [ ] errorHandler.test.js - Pending
- [ ] validators.test.js - Pending
- [ ] formatters.test.js - Pending
