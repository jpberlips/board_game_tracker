/**
 * Unit tests for ThemeContext
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../../contexts/ThemeContext';

// Test component to use the theme context
const TestComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <div>
      <span data-testid="theme-status">{isDark ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset document class
    document.documentElement.className = '';
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('ThemeProvider', () => {
    test('provides default light theme when no localStorage value', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
      expect(document.documentElement).not.toHaveClass('dark');
    });

    test('reads theme from localStorage when available', () => {
      localStorage.setItem('darkMode', 'true');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
      expect(document.documentElement).toHaveClass('dark');
    });

    test('respects system preference when no localStorage value', () => {
      // Mock system preference for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
      expect(document.documentElement).toHaveClass('dark');
    });

    test('allows setting initial theme via prop', () => {
      render(
        <ThemeProvider initialTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
      expect(document.documentElement).toHaveClass('dark');
    });
  });

  describe('Theme Toggle Functionality', () => {
    test('toggles from light to dark theme', () => {
      render(
        <ThemeProvider initialTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('toggle-button'));

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
      expect(document.documentElement).toHaveClass('dark');
      expect(localStorage.getItem('darkMode')).toBe('true');
    });

    test('toggles from dark to light theme', () => {
      render(
        <ThemeProvider initialTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');

      fireEvent.click(screen.getByTestId('toggle-button'));

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
      expect(document.documentElement).not.toHaveClass('dark');
      expect(localStorage.getItem('darkMode')).toBe('false');
    });

    test('persists theme changes to localStorage', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Toggle to dark
      fireEvent.click(screen.getByTestId('toggle-button'));
      expect(localStorage.getItem('darkMode')).toBe('true');

      // Toggle back to light
      fireEvent.click(screen.getByTestId('toggle-button'));
      expect(localStorage.getItem('darkMode')).toBe('false');
    });
  });

  describe('Document Class Management', () => {
    test('adds dark class to document when dark theme is active', () => {
      render(
        <ThemeProvider initialTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass('dark');
    });

    test('removes dark class from document when light theme is active', () => {
      // Start with dark class
      document.documentElement.classList.add('dark');

      render(
        <ThemeProvider initialTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).not.toHaveClass('dark');
    });

    test('updates document class when theme is toggled', () => {
      render(
        <ThemeProvider initialTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).not.toHaveClass('dark');

      fireEvent.click(screen.getByTestId('toggle-button'));

      expect(document.documentElement).toHaveClass('dark');
    });
  });

  describe('useTheme Hook', () => {
    test('throws error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    test('provides correct context values', () => {
      const ContextChecker = () => {
        const context = useTheme();
        
        return (
          <div>
            <span data-testid="has-isdark">{typeof context.isDark === 'boolean' ? 'yes' : 'no'}</span>
            <span data-testid="has-toggle">{typeof context.toggleTheme === 'function' ? 'yes' : 'no'}</span>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <ContextChecker />
        </ThemeProvider>
      );

      expect(screen.getByTestId('has-isdark')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-toggle')).toHaveTextContent('yes');
    });
  });

  describe('Multiple Components', () => {
    test('updates all consuming components when theme changes', () => {
      const Component1 = () => {
        const { isDark } = useTheme();
        return <span data-testid="component1">{isDark ? 'dark' : 'light'}</span>;
      };

      const Component2 = () => {
        const { isDark, toggleTheme } = useTheme();
        return (
          <div>
            <span data-testid="component2">{isDark ? 'dark' : 'light'}</span>
            <button onClick={toggleTheme} data-testid="toggle2">Toggle</button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <Component1 />
          <Component2 />
        </ThemeProvider>
      );

      expect(screen.getByTestId('component1')).toHaveTextContent('light');
      expect(screen.getByTestId('component2')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('toggle2'));

      expect(screen.getByTestId('component1')).toHaveTextContent('dark');
      expect(screen.getByTestId('component2')).toHaveTextContent('dark');
    });
  });

  describe('Edge Cases', () => {
    test('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('darkMode', 'invalid-json');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should fall back to system preference or light theme
      expect(screen.getByTestId('theme-status')).toHaveTextContent(/^(light|dark)$/);
    });

    test('handles missing matchMedia gracefully', () => {
      // Remove matchMedia
      delete window.matchMedia;

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should default to light theme
      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
    });

    test('handles localStorage being unavailable', () => {
      // Mock localStorage to throw errors
      const originalLocalStorage = global.localStorage;
      global.localStorage = {
        getItem: jest.fn(() => { throw new Error('LocalStorage unavailable'); }),
        setItem: jest.fn(() => { throw new Error('LocalStorage unavailable'); }),
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should still work, falling back to default behavior
      expect(screen.getByTestId('theme-status')).toHaveTextContent(/^(light|dark)$/);

      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });
  });

  describe('Performance', () => {
    test('does not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const CountingComponent = () => {
        renderCount++;
        const { isDark } = useTheme();
        return <span>{isDark ? 'dark' : 'light'}</span>;
      };

      const { rerender } = render(
        <ThemeProvider>
          <CountingComponent />
        </ThemeProvider>
      );

      const initialRenderCount = renderCount;

      // Re-render with same props should not cause CountingComponent to re-render
      rerender(
        <ThemeProvider>
          <CountingComponent />
        </ThemeProvider>
      );

      expect(renderCount).toBe(initialRenderCount);
    });
  });
});