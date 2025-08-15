'use client';

import React, { createContext, use, useEffect, useState } from 'react';

type ThemeColors = {
  primaryColor: string;
  textColor: string;
  textColorSecondary: string;
  lightPrimaryColor: string;
  invalidPrimaryColor: string;
  primaryColorText: string;
  scale: string;
  fontMobile: string;
};

const ThemeContext = createContext<ThemeColors | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeColors>({
    primaryColor: '#ffffff',
    textColor: '#12850f',
    textColorSecondary: '#1a961a',
    lightPrimaryColor: '#e3e320',
    invalidPrimaryColor: '#1423c7',
    primaryColorText: '#050505',
    scale: '14',
    fontMobile: '14',
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('defautlThemeweb');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setTheme(parsedTheme);

        // Apply theme to CSS variables
        const root = document.documentElement;
        Object.entries(parsedTheme).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value as string);
        });
      } catch (error) {
        console.error('Error parsing theme:', error);
      }
    }
  }, []);

  return (
    React.createElement(
      ThemeContext.Provider,
      { value: theme },
      children,
    )
  );
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
