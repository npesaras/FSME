import { useEffect, useState } from 'react';

/**
 * A custom hook that follows the app's active theme and falls back to the
 * operating system preference when the app theme has not been initialized yet.
 *
 * @returns {'light' | 'dark'} The current active color scheme.
 */
const useSystemColorScheme = (): 'light' | 'dark' => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const root = document.documentElement;

    const getActiveTheme = (): 'light' | 'dark' => {
      const dataTheme = root.getAttribute('data-theme');

      if (dataTheme === 'light' || dataTheme === 'dark') {
        return dataTheme;
      }

      if (root.classList.contains('dark')) {
        return 'dark';
      }

      if (root.classList.contains('light')) {
        return 'light';
      }

      return mediaQuery.matches ? 'dark' : 'light';
    };

    const updateColorScheme = () => {
      setColorScheme(getActiveTheme());
    };

    const observer = new MutationObserver(updateColorScheme);

    updateColorScheme();
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    mediaQuery.addEventListener('change', updateColorScheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateColorScheme);
    };
  }, []);

  return colorScheme;
};

export default useSystemColorScheme;
