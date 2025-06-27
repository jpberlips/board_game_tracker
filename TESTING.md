# Testing Guide - Board Game Tracker

This document provides comprehensive information about testing the Board Game Tracker application.

## Table of Contents

1. [Overview](#overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Coverage](#test-coverage)
7. [Continuous Integration](#continuous-integration)
8. [Best Practices](#best-practices)

## Overview

The Board Game Tracker uses a comprehensive testing strategy with multiple test types:

- **Unit Tests**: Test individual components/functions in isolation
- **Integration Tests**: Test interactions between components
- **API Tests**: Test HTTP endpoints and database interactions
- **End-to-End Tests**: Test complete user workflows

### Testing Stack

**Backend:**
- pytest - Testing framework
- pytest-flask - Flask-specific testing utilities
- pytest-cov - Coverage reporting
- requests-mock - HTTP request mocking

**Frontend:**
- Jest - Testing framework
- React Testing Library - Component testing utilities
- Cypress - End-to-end testing (optional)

## Backend Testing

### Directory Structure

```
backend/tests/
├── conftest.py              # Shared fixtures and configuration
├── pytest.ini              # Pytest configuration
├── unit/                    # Unit tests
│   ├── test_models.py       # Database model tests
│   ├── test_scraper.py      # BGG scraper tests
│   └── test_ai_suggestions.py # AI functionality tests
├── integration/             # Integration tests
│   ├── test_api_games.py    # Games API endpoint tests
│   ├── test_api_sessions.py # Sessions API endpoint tests
│   └── test_api_statistics.py # Statistics API tests
└── reports/                 # Test reports (generated)
```

### Test Categories

#### Unit Tests

**Models (`test_models.py`):**
- Game, Player, Session, Tag, WishlistItem model creation
- Validation and constraints
- Relationships and cascading deletes
- Serialization (to_dict methods)

**Scraper (`test_scraper.py`):**
- BGG game data scraping
- Hot games list retrieval
- Error handling and rate limiting
- Data parsing and validation

**AI Suggestions (`test_ai_suggestions.py`):**
- Claude API integration
- Suggestion logic with/without API key
- Error handling and fallbacks
- Prompt construction

#### Integration Tests

**API Endpoints (`test_api_*.py`):**
- CRUD operations for all entities
- Request/response validation
- Authentication and authorization
- Error handling and edge cases

### Running Backend Tests

```bash
# Install test dependencies
cd backend
pip install -r requirements-test.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test categories
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m api          # API tests only

# Run specific test file
pytest tests/unit/test_models.py

# Run with verbose output
pytest -v

# Run tests in parallel
pytest -n auto
```

### Test Configuration

The `pytest.ini` file contains:
- Test discovery patterns
- Coverage settings (80% minimum)
- Output formats (HTML, terminal)
- Test markers for categorization
- Timeout settings

## Frontend Testing

### Directory Structure

```
frontend/src/__tests__/
├── utils/
│   └── testUtils.js         # Test utilities and helpers
├── unit/
│   ├── components/          # Component unit tests
│   │   ├── GameCard.test.js
│   │   ├── AddGameModal.test.js
│   │   └── ThemeToggle.test.js
│   ├── contexts/            # Context tests
│   │   ├── ThemeContext.test.js
│   │   └── ToastContext.test.js
│   └── services/            # Service tests
│       └── api.test.js
├── integration/             # Integration tests
│   ├── pages/               # Page component tests
│   │   ├── GamesPage.test.js
│   │   ├── SessionsPage.test.js
│   │   └── StatisticsPage.test.js
│   └── workflows/           # User workflow tests
│       ├── gameManagement.test.js
│       └── sessionLogging.test.js
└── setupTests.js           # Jest configuration
```

### Test Categories

#### Unit Tests

**Components:**
- Rendering with various props
- User interactions (clicks, form inputs)
- Conditional rendering logic
- Accessibility features
- Dark mode support

**Contexts:**
- State management functionality
- Provider/consumer patterns
- localStorage persistence
- Error boundaries

**Services:**
- API call functions
- Request/response handling
- Error handling
- Data transformation

#### Integration Tests

**Pages:**
- Complete page rendering
- API integration with mocking
- Form submissions and validation
- Navigation and routing

**Workflows:**
- Multi-step user interactions
- Cross-component communication
- State persistence across actions

### Running Frontend Tests

```bash
# Install dependencies (if not already done)
cd frontend
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode (non-interactive)
npm run test:ci

# Run specific test file
npm test GameCard.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="theme"

# Update snapshots (if using)
npm test -- --updateSnapshot
```

### Test Utilities

The `testUtils.js` file provides:

- `renderWithProviders()` - Renders components with all necessary context providers
- Mock data objects (games, players, sessions, etc.)
- API mocking utilities
- Custom testing helpers
- Accessibility testing utilities

## Writing Tests

### Backend Test Examples

```python
# Unit test example
def test_game_creation(clean_db):
    game = Game(name="Test Game", owner="Test Owner")
    clean_db.session.add(game)
    clean_db.session.commit()
    
    assert game.id is not None
    assert game.name == "Test Game"

# API test example
def test_create_game(client, clean_db):
    game_data = {'name': 'New Game', 'owner': 'Owner'}
    response = client.post('/api/games', 
                          data=json.dumps(game_data),
                          content_type='application/json')
    
    assert response.status_code == 201
    assert response.json['name'] == 'New Game'
```

### Frontend Test Examples

```javascript
// Component test example
test('renders game information correctly', () => {
  renderWithProviders(<GameCard game={mockGame} />);
  
  expect(screen.getByText('Test Game')).toBeInTheDocument();
  expect(screen.getByText('Test Owner')).toBeInTheDocument();
});

// User interaction test
test('calls onEdit when edit button is clicked', () => {
  const onEdit = jest.fn();
  renderWithProviders(<GameCard game={mockGame} onEdit={onEdit} />);
  
  fireEvent.click(screen.getByRole('button', { name: /edit/i }));
  
  expect(onEdit).toHaveBeenCalledWith(mockGame);
});
```

## Test Coverage

### Coverage Goals

- **Backend**: Minimum 80% code coverage
- **Frontend**: Minimum 75% code coverage
- **Critical paths**: 95%+ coverage (API endpoints, core business logic)

### Coverage Reports

**Backend:**
```bash
pytest --cov=. --cov-report=html
# View: htmlcov/index.html
```

**Frontend:**
```bash
npm run test:coverage
# View: coverage/lcov-report/index.html
```

### Coverage Exclusions

Files/patterns excluded from coverage:
- Test files themselves
- Configuration files
- Migration scripts
- Development-only utilities

## Continuous Integration

### GitHub Actions

Example CI configuration (`.github/workflows/test.yml`):

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.8
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=. --cov-fail-under=80

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm run test:ci
```

## Best Practices

### General Testing Principles

1. **Write tests first** (TDD) when possible
2. **Test behavior, not implementation** details
3. **Use descriptive test names** that explain what is being tested
4. **Keep tests isolated** and independent
5. **Mock external dependencies** (APIs, databases, etc.)
6. **Test edge cases** and error conditions
7. **Maintain test data** separate from production data

### Backend Testing Best Practices

1. **Use fixtures** for common test data setup
2. **Test database transactions** in isolation
3. **Mock external API calls** to BGG and Claude
4. **Test both success and failure paths**
5. **Validate input sanitization** and security
6. **Test rate limiting** and performance constraints

### Frontend Testing Best Practices

1. **Test from user's perspective** using React Testing Library
2. **Mock API calls** consistently across tests
3. **Test accessibility features** (ARIA labels, keyboard navigation)
4. **Test responsive behavior** where applicable
5. **Use semantic queries** (getByRole, getByLabelText)
6. **Test error states** and loading states
7. **Avoid testing implementation details** (CSS classes, internal state)

### Test Data Management

1. **Use factories** for creating test data
2. **Keep test data minimal** but realistic
3. **Clean up after tests** to prevent interference
4. **Use meaningful test data** that reflects real usage
5. **Version control test data** when appropriate

### Performance Testing

1. **Set reasonable timeouts** for async operations
2. **Test with realistic data volumes**
3. **Monitor test execution time**
4. **Use parallel execution** where possible
5. **Profile slow tests** and optimize

## Troubleshooting

### Common Issues

**Backend:**
- Database connection issues → Check test database setup
- Import errors → Verify PYTHONPATH and dependencies
- Fixture conflicts → Check fixture scope and cleanup

**Frontend:**
- Component not found → Check test queries and rendering
- Async issues → Use waitFor and proper async/await
- Mock issues → Verify mock setup and cleanup

### Debug Tips

1. **Use debugger statements** in tests
2. **Check test output** and error messages carefully
3. **Run single tests** to isolate issues
4. **Verify test data** setup and cleanup
5. **Check mock configurations** for external dependencies

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)