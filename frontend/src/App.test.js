import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    BrowserRouter: ({ children }) => React.createElement('div', { 'data-testid': 'router' }, children),
    Routes: ({ children }) => React.createElement('div', { 'data-testid': 'routes' }, children),
    Route: ({ element }) => React.createElement('div', { 'data-testid': 'route' }, element),
    Navigate: () => React.createElement('div', null, 'Navigate'),
    Link: ({ children, to }) => React.createElement('a', { href: to }, children),
    NavLink: ({ children, to }) => React.createElement('a', { href: to }, children),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/', search: '' }),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
    useParams: () => ({})
  };
});

import App from './App';

test('renders Legal Metrology platform application shell without crashing', () => {
  render(<App />);
  const headerElements = screen.getAllByText(/Legal Metrology/i);
  expect(headerElements.length).toBeGreaterThan(0);
});
