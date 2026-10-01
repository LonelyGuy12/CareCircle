import { useTheme } from '../../hooks/use-theme';
import { Button } from './button';

export function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const dark = theme === 'dark';
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-pressed={dark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
            {dark ? 'Light' : 'Dark'}
        </Button>
    );
}
