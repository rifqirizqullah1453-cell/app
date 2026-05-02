import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggle: () => {} });

export function useTheme() { return useContext(ThemeContext); }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('boh_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('boh_theme', isDark ? 'dark' : 'light'); } catch {}
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggle = () => setIsDark(d => !d);

  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>;
}
