import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Check localStorage
    const saved = localStorage.getItem('monevo-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // 2. Respect OS preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    // 3. Default light
    return 'light';
  });

  useEffect(() => {
    // Apply to <html> as data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('monevo-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
