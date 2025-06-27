/**
 * Basic tests to verify test setup is working
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Basic component for testing
const BasicComponent = ({ message = 'Hello Test' }) => (
  <div data-testid="basic-component">{message}</div>
);

describe('Basic Test Setup', () => {
  test('renders basic component', () => {
    render(<BasicComponent />);
    expect(screen.getByTestId('basic-component')).toBeInTheDocument();
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    render(<BasicComponent message="Custom Message" />);
    expect(screen.getByText('Custom Message')).toBeInTheDocument();
  });

  test('localStorage mock works', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });

  test('window.matchMedia mock works', () => {
    expect(window.matchMedia).toBeDefined();
    expect(typeof window.matchMedia).toBe('function');
  });
});