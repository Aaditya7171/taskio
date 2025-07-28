import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType } from '@/types';
import { themeCookies } from '@/utils/cookies';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try cookies first, then localStorage as fallback
    const cookieTheme = themeCookies.getTheme() as Theme;
    const savedTheme = localStorage.getItem('taskio-theme') as Theme;
    return cookieTheme || savedTheme || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('dark', 'minimal');
    
    // Add current theme class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'minimal') {
      root.classList.add('minimal');
    }
    
    // Save to both cookies and localStorage
    themeCookies.setTheme(theme as 'dark' | 'light' | 'system');
    localStorage.setItem('taskio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'minimal' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
