import { useEffect } from 'react';
import useStore from '../store';

const ThemeManager = () => {
    const theme = useStore(state => state.appSettings.theme);

    // Effect to apply the theme class when the theme setting changes
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        root.classList.toggle('dark', isDark);
        root.classList.toggle('theme-dark', isDark);
        root.classList.toggle('theme-light', !isDark);
    }, [theme]);

    // Effect to listen for OS-level theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (useStore.getState().appSettings.theme === 'system') {
                const root = window.document.documentElement;
                root.classList.toggle('dark', e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return null; // This component does not render anything
};

export default ThemeManager;
