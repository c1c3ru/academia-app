# Testing Guide - Academia App

This document provides comprehensive information about the testing infrastructure and practices for the Academia App.

## 🧪 Testing Overview

The Academia App uses a multi-layered testing approach:

1. **Unit Tests** - Test individual components and functions in isolation
2. **Integration Tests** - Test interactions between components and services
3. **End-to-End Tests** - Test complete user workflows

## 🛠️ Testing Stack

### Core Testing Tools
- **Jest** - JavaScript testing framework
- **React Native Testing Library** - Component testing utilities
- **Detox** - End-to-end testing framework for React Native

### Additional Tools
- **@testing-library/jest-native** - Custom Jest matchers
- **react-test-renderer** - React component rendering for tests
- **eslint-plugin-testing-library** - ESLint rules for testing best practices

## 📁 Test Structure

```
src/
├── __tests__/
│   └── setup.js                    # Global test setup
├── components/
│   └── __tests__/
│       ├── ActionButton.test.js    # Component unit tests
│       ├── AnimatedCard.test.js
│       └── QRCodeGenerator.test.js
├── contexts/
│   └── __tests__/
│       └── AuthProvider.test.js    # Context integration tests
├── screens/
│   └── __tests__/
│       ├── LoginScreen.integration.test.js
│       ├── AdminDashboard.integration.test.js
│       └── AdminStudents.integration.test.js
├── services/
│   └── __tests__/
│       ├── firestoreService.test.js
│       ├── paymentService.test.js
│       └── ...
└── utils/
    └── __tests__/
        └── customClaimsHelper.test.js

e2e/
├── jest.config.js                  # E2E Jest configuration
├── setup.js                       # E2E test setup
├── auth.test.js                    # Authentication flow tests
├── admin-flow.test.js              # Admin user journey tests
├── student-flow.test.js            # Student user journey tests
├── instructor-flow.test.js         # Instructor user journey tests
└── onboarding-flow.test.js         # Onboarding process tests
```

## 🚀 Running Tests

### Quick Commands

```bash
# Run all unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# CI environment
npm run test:ci

# End-to-end tests
npm run test:e2e

# Build E2E tests
npm run test:e2e:build
```

### Using Test Runner Script

```bash
# Run specific test types
node scripts/test-runner.js unit
node scripts/test-runner.js integration
node scripts/test-runner.js e2e
node scripts/test-runner.js coverage
node scripts/test-runner.js all

# Show help
node scripts/test-runner.js help
```

## 📝 Writing Tests

### Unit Test Example

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import ActionButton from '../ActionButton';

const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

describe('ActionButton', () => {
  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <ActionButton onPress={mockOnPress}>Test Button</ActionButton>
      </TestWrapper>
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example

```javascript
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../AuthProvider';
import { auth } from '../../services/firebase';

describe('AuthProvider Integration', () => {
  it('provides initial auth state', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user')).toHaveTextContent('No user');
    });
  });
});
```

### E2E Test Example

```javascript
const { device, expect, element, by, waitFor } = require('detox');

describe('Authentication Flow E2E', () => {
  it('should successfully login admin user', async () => {
    await loginAsAdmin();
    await expect(element(by.id('admin-dashboard'))).toBeVisible();
  });
});
```

## 🎯 Test Categories

### 1. Unit Tests
**Purpose**: Test individual components/functions in isolation
**Location**: `src/**/__tests__/*.test.js`
**Examples**:
- Component rendering
- Function logic
- State management
- Props handling

### 2. Integration Tests
**Purpose**: Test component interactions and data flow
**Location**: `src/**/__tests__/*.integration.test.js`
**Examples**:
- Authentication flow
- API service integration
- Context provider behavior
- Screen navigation

### 3. End-to-End Tests
**Purpose**: Test complete user workflows
**Location**: `e2e/*.test.js`
**Examples**:
- User registration and login
- Admin dashboard operations
- Student check-in process
- Payment workflows

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- Custom setup files
- Module name mapping
- Coverage thresholds
- Transform ignore patterns

### Detox Configuration (`.detoxrc.js`)
- Device configurations
- App build settings
- Platform-specific setups

## 🎭 Mocking Strategy

### Firebase Services
```javascript
jest.mock('../services/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    // ... other mocked methods
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn()
  }
}));
```

### React Navigation
```javascript
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  })
}));
```

### Expo Modules
```javascript
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons'
}));
```

## 📊 Coverage Goals

| Type | Branches | Functions | Lines | Statements |
|------|----------|-----------|-------|------------|
| Global | 70% | 70% | 70% | 70% |

## 🚨 Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking
- Mock external dependencies
- Use realistic mock data
- Reset mocks between tests

### 3. Assertions
- Use specific matchers
- Test behavior, not implementation
- Verify error cases

### 4. E2E Tests
- Test critical user paths
- Use stable selectors (testID)
- Keep tests independent

## 🔍 Debugging Tests

### Common Issues
1. **Async operations**: Use `waitFor` for async updates
2. **Navigation**: Mock navigation properly
3. **Firebase**: Ensure proper mocking setup
4. **Timing**: Add appropriate delays for E2E tests

### Debug Commands
```bash
# Run specific test file
npm test -- ActionButton.test.js

# Run tests in debug mode
npm test -- --detectOpenHandles

# Verbose output
npm test -- --verbose
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:e2e:build
    npm run test:e2e
```

### Coverage Reports
- Generated in `coverage/` directory
- HTML reports available at `coverage/lcov-report/index.html`
- Integrated with CI for pull request checks

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new features:
1. Write unit tests for new components
2. Add integration tests for complex flows
3. Update E2E tests for new user journeys
4. Maintain coverage thresholds
5. Follow existing test patterns

---

For questions or issues with testing, please refer to the main project documentation or create an issue in the repository.
