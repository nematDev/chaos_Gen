import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'zinc' | 'blue' | 'rose';
export type Mode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'zinc';
  });

  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem('app-mode') as Mode) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Remove old classes
    root.classList.remove('light', 'dark');
    body.classList.remove('theme-zinc', 'theme-blue', 'theme-rose');

    // Add new classes
    root.classList.add(mode);
    body.classList.add(`theme-${theme}`);

    // Persist
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-mode', mode);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};