import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import App from '../App';

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
    useParams: () => ({}),
  };
});

jest.setTimeout(60000);

describe('Full App Language Toggle Integration Test', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('activates the existing Hindi / English toggle button and changes visible UI language', async () => {
    const { container } = render(<App />);

    // 1. Initial State: English
    expect(screen.getAllByText(/Legal Metrology Verification System/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Key Features/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Public User Portal/i).length).toBeGreaterThan(0);

    // Find existing language toggle button
    const toggleBtn = container.querySelector('#language-toggle-btn');
    expect(toggleBtn).toBeInTheDocument();

    const hindiSpan = within(toggleBtn).getByText('हिन्दी');
    expect(hindiSpan).toBeInTheDocument();

    const englishSpan = within(toggleBtn).getByText('English');
    expect(englishSpan).toBeInTheDocument();

    // 2. Click Hindi button
    await act(async () => {
      fireEvent.click(hindiSpan);
    });

    // Check localStorage persistence
    expect(localStorage.getItem('language')).toBe('hi');

    // 3. Verify Visible UI in Hindi
    expect(screen.getAllByText(/विधिक मापविज्ञान सत्यापन प्रणाली/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/प्रमुख विशेषताएं/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/सार्वजनिक उपयोगकर्ता पोर्टल/i).length).toBeGreaterThan(0);

    // 4. Click English button to restore
    await act(async () => {
      fireEvent.click(englishSpan);
    });

    // Check localStorage updated back to 'en'
    expect(localStorage.getItem('language')).toBe('en');

    // Verify exact English text restored
    expect(screen.getAllByText(/Legal Metrology Verification System/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Key Features/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Public User Portal/i).length).toBeGreaterThan(0);
  }, 60000);

  test('restores previously selected Hindi language on page reload / remount', async () => {
    localStorage.setItem('language', 'hi');

    render(<App />);

    // Since localStorage has 'hi', it should render in Hindi immediately on reload
    expect(screen.getAllByText(/विधिक मापविज्ञान सत्यापन प्रणाली/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/प्रमुख विशेषताएं/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/सार्वजनिक उपयोगकर्ता पोर्टल/i).length).toBeGreaterThan(0);
  });
});
