import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { TRANSLATIONS, HINDI_MAP, HINDI_MAP_LOWER, PHRASE_KEYS_DESC, translate as directTranslate } from './translations';

export const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (text) => text,
  translations: TRANSLATIONS,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language from localStorage:', e);
    }
    return 'en';
  });

  const languageRef = useRef(language);
  languageRef.current = language;

  const originalTextMap = useRef(new WeakMap());
  const originalAttrMap = useRef(new WeakMap());
  const isMutatingRef = useRef(false);

  const isDevanagari = (val) => typeof val === 'string' && /[\u0900-\u097F]/.test(val);

  // Helper to translate a string
  const translateString = useCallback((str) => {
    if (!str || typeof str !== 'string') return str;
    const clean = str.replace(/\u00a0/g, ' ').replace(/&amp;/g, '&');
    const trimmed = clean.trim();
    if (!trimmed) return str;

    const leading = str.match(/^\s*/)[0];
    const trailing = str.match(/\s*$/)[0];
    const normalized = trimmed.replace(/\s+/g, ' ');

    // 1. Direct match check
    if (HINDI_MAP[trimmed]) {
      return leading + HINDI_MAP[trimmed] + trailing;
    }

    // 2. Normalized whitespace match check
    if (HINDI_MAP[normalized]) {
      return leading + HINDI_MAP[normalized] + trailing;
    }

    // 3. Lowercase normalized match check
    const lower = normalized.toLowerCase();
    if (HINDI_MAP_LOWER[lower]) {
      return leading + HINDI_MAP_LOWER[lower] + trailing;
    }

    // Skip technical patterns: URLs, emails, codes, cert IDs
    if (
      /@/.test(str) ||
      /^https?:\/\//i.test(str) ||
      /^[A-Z0-9_-]{12,}$/.test(trimmed) ||
      /^(CERT|APP|LMO|GATC|REF|TXN)-/i.test(trimmed)
    ) {
      return str;
    }

    // 4. Prefix / Suffix pattern checks
    // Bullet / icon prefix: e.g. "· An LMO officer will review...", "✓ ...", "✗ ..."
    const punctPrefixMatch = trimmed.match(/^([·•\-*–—✓✗🔬⚖️ℹ️⚠️✅]+\s*)/);
    if (punctPrefixMatch) {
      const prefix = punctPrefixMatch[1];
      const rest = trimmed.slice(prefix.length).trim();
      if (HINDI_MAP[rest]) {
        return leading + prefix + HINDI_MAP[rest] + trailing;
      }
      if (HINDI_MAP_LOWER[rest.toLowerCase()]) {
        return leading + prefix + HINDI_MAP_LOWER[rest.toLowerCase()] + trailing;
      }
    }

    // Trailing colon: e.g. "Status:", "Mode:", "Email:"
    if (trimmed.endsWith(':')) {
      const rest = trimmed.slice(0, -1).trim();
      if (HINDI_MAP[rest]) {
        return leading + HINDI_MAP[rest] + ':' + trailing;
      }
      if (HINDI_MAP_LOWER[rest.toLowerCase()]) {
        return leading + HINDI_MAP_LOWER[rest.toLowerCase()] + ':' + trailing;
      }
    }

    // Enclosing parentheses: e.g. "(Pending LMO Sign)", "(Ineligible)"
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      const inside = trimmed.slice(1, -1).trim();
      if (HINDI_MAP[inside]) {
        return leading + '(' + HINDI_MAP[inside] + ')' + trailing;
      }
      if (HINDI_MAP_LOWER[inside.toLowerCase()]) {
        return leading + '(' + HINDI_MAP_LOWER[inside.toLowerCase()] + ')' + trailing;
      }
    }

    // Trailing arrows: e.g. "Create Account →", "Next Step →"
    if (trimmed.endsWith(' →') || trimmed.endsWith(' ->')) {
      const rest = trimmed.replace(/\s*(?:→|->)$/, '').trim();
      if (HINDI_MAP[rest]) {
        return leading + HINDI_MAP[rest] + ' →' + trailing;
      }
      if (HINDI_MAP_LOWER[rest.toLowerCase()]) {
        return leading + HINDI_MAP_LOWER[rest.toLowerCase()] + ' →' + trailing;
      }
    }

    // Leading arrows: e.g. "← Back", "<- Previous"
    if (trimmed.startsWith('← ') || trimmed.startsWith('<- ')) {
      const rest = trimmed.replace(/^(?:←|<-)\s*/, '').trim();
      if (HINDI_MAP[rest]) {
        return leading + '← ' + HINDI_MAP[rest] + trailing;
      }
      if (HINDI_MAP_LOWER[rest.toLowerCase()]) {
        return leading + '← ' + HINDI_MAP_LOWER[rest.toLowerCase()] + trailing;
      }
    }

    // 5. If already contains Devanagari characters, do not re-mangle
    if (isDevanagari(trimmed)) {
      return str;
    }

    // 6. Phrase-level replacement for compound phrases / multiline text
    let result = str;
    let modified = false;
    for (let i = 0; i < PHRASE_KEYS_DESC.length; i++) {
      const key = PHRASE_KEYS_DESC[i];
      if (!HINDI_MAP[key]) continue;

      if (key === 'LMO') {
        const lmoRegex = /(^|[^\w(])LMO([^\w)]|$)/;
        if (lmoRegex.test(result)) {
          result = result.replace(/(^|[^\w(])LMO([^\w)]|$)/g, (match, p1, p2) => `${p1}${HINDI_MAP[key]}${p2}`);
          modified = true;
        }
        continue;
      }

      if (key === 'GATC') {
        const gatcRegex = /(^|[^\w(])GATC([^\w)]|$)/;
        if (gatcRegex.test(result)) {
          result = result.replace(/(^|[^\w(])GATC([^\w)]|$)/g, (match, p1, p2) => `${p1}${HINDI_MAP[key]}${p2}`);
          modified = true;
        }
        continue;
      }

      // Do NOT replace single short words like 'to', 'in', 'at', 'or', 'new' inside larger arbitrary phrases
      if (key.length <= 3) {
        continue;
      }

      if (result.includes(key)) {
        result = result.split(key).join(HINDI_MAP[key]);
        modified = true;
      } else if (key.includes(' ')) {
        // Try regex match with flexible whitespace
        try {
          const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escaped.replace(/\s+/g, '\\s+'), 'gi');
          if (regex.test(result)) {
            result = result.replace(regex, HINDI_MAP[key]);
            modified = true;
          }
        } catch (e) {}
      }
    }

    return modified ? result : str;
  }, []);

  // Process a text node
  const processTextNode = useCallback(
    (node, currentLang) => {
      if (!node || !node.nodeValue) return;
      const parent = node.parentElement;
      if (!parent) return;

      const tag = parent.tagName.toLowerCase();
      if (
        tag === 'script' ||
        tag === 'style' ||
        tag === 'code' ||
        tag === 'pre' ||
        tag === 'noscript'
      ) {
        return;
      }

      if (
        parent.closest('[data-no-translate="true"]') ||
        parent.closest('[translate="no"]')
      ) {
        return;
      }

      const textMap = originalTextMap.current;

      if (currentLang === 'hi') {
        let orig = textMap.get(node);
        if (orig === undefined) {
          orig = node.nodeValue;
        } else if (
          node.nodeValue !== orig &&
          !isDevanagari(node.nodeValue)
        ) {
          // If nodeValue was updated by React to a new English string
          orig = node.nodeValue;
        }

        const translated = translateString(orig);
        if (translated !== orig) {
          textMap.set(node, orig);
          if (translated !== node.nodeValue) {
            isMutatingRef.current = true;
            node.nodeValue = translated;
            isMutatingRef.current = false;
          }
        }
      } else {
        // Restore English
        if (textMap.has(node)) {
          const orig = textMap.get(node);
          textMap.delete(node);
          if (orig !== undefined && node.nodeValue !== orig) {
            isMutatingRef.current = true;
            node.nodeValue = orig;
            isMutatingRef.current = false;
          }
        }
      }
    },
    [translateString]
  );

  // Process element attributes (placeholder, title, aria-label)
  const processElementAttributes = useCallback(
    (el, currentLang) => {
      if (!el || !el.getAttribute) return;
      if (
        el.closest &&
        (el.closest('[data-no-translate="true"]') || el.closest('[translate="no"]'))
      ) {
        return;
      }

      const attrMap = originalAttrMap.current;
      const attrs = ['placeholder', 'title', 'aria-label'];

      attrs.forEach((attr) => {
        const val = el.getAttribute(attr);
        if (!val) return;

        let elAttrs = attrMap.get(el);
        if (!elAttrs) {
          elAttrs = {};
          attrMap.set(el, elAttrs);
        }

        if (currentLang === 'hi') {
          let orig = elAttrs[attr];
          if (orig === undefined) {
            orig = val;
          } else if (
            val !== orig &&
            !isDevanagari(val)
          ) {
            orig = val;
          }

          const translated = translateString(orig);
          if (translated !== orig) {
            elAttrs[attr] = orig;
            if (translated !== val) {
              isMutatingRef.current = true;
              el.setAttribute(attr, translated);
              isMutatingRef.current = false;
            }
          }
        } else {
          if (elAttrs[attr] !== undefined) {
            const orig = elAttrs[attr];
            delete elAttrs[attr];
            if (val !== orig) {
              isMutatingRef.current = true;
              el.setAttribute(attr, orig);
              isMutatingRef.current = false;
            }
          }
        }
      });
    },
    [translateString]
  );

  // Traverse a DOM subtree
  const translateSubtree = useCallback(
    (rootNode, currentLang) => {
      if (!rootNode || typeof document === 'undefined') return;

      if (rootNode.nodeType === Node.TEXT_NODE) {
        processTextNode(rootNode, currentLang);
        return;
      }

      if (rootNode.nodeType === Node.ELEMENT_NODE) {
        processElementAttributes(rootNode, currentLang);
      }

      const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (n) => {
            if (n.nodeType === Node.ELEMENT_NODE) {
              const tag = n.tagName ? n.tagName.toLowerCase() : '';
              if (
                tag === 'script' ||
                tag === 'style' ||
                tag === 'code' ||
                tag === 'pre' ||
                tag === 'noscript'
              ) {
                return NodeFilter.FILTER_REJECT;
              }
              if (
                n.getAttribute &&
                (n.getAttribute('data-no-translate') === 'true' ||
                  n.getAttribute('translate') === 'no')
              ) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
            if (n.nodeType === Node.TEXT_NODE) {
              if (!n.nodeValue || !n.nodeValue.trim()) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          },
        }
      );

      let currentNode = walker.nextNode();
      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          processTextNode(currentNode, currentLang);
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
          processElementAttributes(currentNode, currentLang);
        }
        currentNode = walker.nextNode();
      }
    },
    [processTextNode, processElementAttributes]
  );

  const setLanguage = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'hi') return;
    setLanguageState(newLang);
    languageRef.current = newLang;
    try {
      localStorage.setItem('language', newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
        translateSubtree(document.body, newLang);
      }
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
  }, [translateSubtree]);

  const toggleLanguage = useCallback(() => {
    setLanguage(languageRef.current === 'en' ? 'hi' : 'en');
  }, [setLanguage]);

  const t = useCallback(
    (text) => {
      return directTranslate(text, language);
    },
    [language]
  );

  // Reactive DOM sync via MutationObserver
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language;

    // Run initial scan
    translateSubtree(document.body, language);

    const observer = new MutationObserver((mutations) => {
      if (isMutatingRef.current) return;

      const currentLang = languageRef.current;
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.type === 'childList') {
          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const added = mutation.addedNodes[j];
            translateSubtree(added, currentLang);
          }
        } else if (mutation.type === 'characterData') {
          processTextNode(mutation.target, currentLang);
        } else if (mutation.type === 'attributes') {
          processElementAttributes(mutation.target, currentLang);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label'],
    });

    // Also run short delayed syncs for async rendered components / routes
    const timer1 = setTimeout(() => {
      translateSubtree(document.body, language);
    }, 100);

    const timer2 = setTimeout(() => {
      translateSubtree(document.body, language);
    }, 350);

    // Sync across browser tabs
    const handleStorageChange = (e) => {
      if (e.key === 'language' && (e.newValue === 'en' || e.newValue === 'hi')) {
        setLanguageState(e.newValue);
        languageRef.current = e.newValue;
        translateSubtree(document.body, e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      observer.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language, translateSubtree, processTextNode, processElementAttributes]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        translations: TRANSLATIONS,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
