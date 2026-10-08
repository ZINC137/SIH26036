import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { translate, TRANSLATIONS, HINDI_MAP } from './translations';

function TestLanguageComponent() {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <button data-testid="btn-toggle" onClick={toggleLanguage}>
        Toggle
      </button>
      <button data-testid="btn-en" onClick={() => setLanguage('en')}>
        Set EN
      </button>
      <button data-testid="btn-hi" onClick={() => setLanguage('hi')}>
        Set HI
      </button>
      <p data-testid="text-translated">{t('Legal Metrology Verification System')}</p>
      <p data-testid="text-portals">{t('Portals')}</p>
      <p data-testid="text-user-portal">{t('Public User Portal')}</p>
      <p data-testid="text-verify">{t('Verify Certificate')}</p>
    </div>
  );
}

describe('Language Localization & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('default language is English', () => {
    render(
      <LanguageProvider>
        <TestLanguageComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('text-translated').textContent).toBe('Legal Metrology Verification System');
    expect(screen.getByTestId('text-portals').textContent).toBe('Portals');
  });

  test('switches language from English to Hindi and translates UI text', () => {
    render(
      <LanguageProvider>
        <TestLanguageComponent />
      </LanguageProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('btn-hi'));
    });

    expect(screen.getByTestId('current-lang').textContent).toBe('hi');
    expect(localStorage.getItem('language')).toBe('hi');
    expect(screen.getByTestId('text-translated').textContent).toBe('विधिक मापविज्ञान सत्यापन प्रणाली');
    expect(screen.getByTestId('text-portals').textContent).toBe('पोर्टल');
    expect(screen.getByTestId('text-user-portal').textContent).toBe('सार्वजनिक उपयोगकर्ता पोर्टल');
    expect(screen.getByTestId('text-verify').textContent).toBe('प्रमाणपत्र सत्यापन');
  });

  test('switches back from Hindi to English and restores exact English UI', () => {
    render(
      <LanguageProvider>
        <TestLanguageComponent />
      </LanguageProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('btn-hi'));
    });
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');

    act(() => {
      fireEvent.click(screen.getByTestId('btn-en'));
    });
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(localStorage.getItem('language')).toBe('en');
    expect(screen.getByTestId('text-translated').textContent).toBe('Legal Metrology Verification System');
    expect(screen.getByTestId('text-portals').textContent).toBe('Portals');
  });

  test('toggle button alternates between English and Hindi', () => {
    render(
      <LanguageProvider>
        <TestLanguageComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');

    act(() => {
      fireEvent.click(screen.getByTestId('btn-toggle'));
    });
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');

    act(() => {
      fireEvent.click(screen.getByTestId('btn-toggle'));
    });
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
  });

  test('persists and restores previously selected language on reload/mount', () => {
    localStorage.setItem('language', 'hi');

    render(
      <LanguageProvider>
        <TestLanguageComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('hi');
    expect(screen.getByTestId('text-translated').textContent).toBe('विधिक मापविज्ञान सत्यापन प्रणाली');
  });

  test('translations dictionary contains required legal metrology terms', () => {
    expect(translate('Application', 'hi')).toBe('आवेदन');
    expect(translate('Verification', 'hi')).toBe('सत्यापन');
    expect(translate('Certificate', 'hi')).toBe('प्रमाणपत्र');
    expect(translate('Instrument', 'hi')).toBe('उपकरण');
    expect(translate('Field Officer', 'hi')).toBe('क्षेत्र अधिकारी');
    expect(translate('Laboratory', 'hi')).toBe('प्रयोगशाला');
    expect(translate('Legal Metrology', 'hi')).toBe('विधिक मापविज्ञान');
    expect(translate('User', 'hi')).toBe('उपयोगकर्ता');
    expect(translate('Submit', 'hi')).toBe('जमा करें');
    expect(translate('Login', 'hi')).toBe('लॉगिन');
    expect(translate('Logout', 'hi')).toBe('लॉगआउट');
    expect(translate('Dashboard', 'hi')).toBe('डैशबोर्ड');
    expect(translate('Status', 'hi')).toBe('स्थिति');
    expect(translate('Documents', 'hi')).toBe('दस्तावेज़');
  });
});
