"use client";
import { createContext, useContext, useEffect, ReactNode } from 'react';

// Governance rule: Lunavia uses light mode only to ensure clarity and operational consistency.
// Dark mode has been disabled. This provider is kept for compatibility but enforces light mode.

type Theme = 'light';
interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Force light mode: remove dark class if present and clear any stored preference
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  return <ThemeContext.Provider value={{ theme: 'light' }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

