import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/theme/ThemeProvider";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggle, t } = useLanguage();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label={t("language.toggle")}
      className={className}
    >
      <Languages className="mr-1.5 size-4" />
      {lang === "en" ? "EN" : "ID"}
    </Button>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={t("theme.toggle")}
      className={className}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function HeaderControls({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}