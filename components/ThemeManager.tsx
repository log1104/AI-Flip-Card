import { useEffect } from 'react';
import useStore from '../store';

const ThemeManager = () => {
    const theme = useStore(state => state.appSettings.theme);

    // Apply the theme class when the theme setting changes
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark';
        root.classList.toggle('dark', isDark);
        root.classList.toggle('theme-dark', isDark);
        root.classList.toggle('theme-light', !isDark);
    }, [theme]);

    return null; // This component does not render anything
};

export default ThemeManager;
