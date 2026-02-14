import { useTheme } from "@/hooks/use-theme";

interface ThemeToggleProps {
  className?: string;
}

const themeIcons = {
  light: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  system: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  ),
};

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const handleClick = () => {
    toggleTheme();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center justify-center h-8 px-3 rounded-md border-2 border-noir-black bg-liberal-blue hover:bg-liberal-blue/90 text-white font-courier text-sm transition-colors dark:border-white/20 ${className}`}
      aria-label={`Current theme: ${themeLabels[theme]} (${resolvedTheme}). Click to change theme.`}
      title={`Theme: ${themeLabels[theme]} (${resolvedTheme}). Click to toggle.`}
      type="button"
    >
      <span className="flex items-center justify-center">
        {themeIcons[theme]}
      </span>
    </button>
  );
}
