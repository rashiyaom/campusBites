"use client";

import { useState, useEffect } from 'react';

export function useTheme() {
  // Initialize with a function to read from DOM immediately
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    // Sync state with current DOM state on mount
    const darkModeEnabled = document.documentElement.classList.contains('dark');
    setIsDark(darkModeEnabled);
    
    // Save to localStorage if not already saved
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      localStorage.setItem('theme', darkModeEnabled ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDark, toggleTheme };
}
