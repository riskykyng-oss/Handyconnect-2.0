import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

// The app is intentionally light-only. We pin the theme to light and never
// apply a `dark` class, regardless of OS preference or any stored setting.
export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
