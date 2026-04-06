import { useState, useEffect } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BgTint = "none" | "slate" | "emerald" | "amber" | "rose";
type ThemeMode = "light" | "dark" | "system";

const tintOptions: Array<{ value: BgTint; label: string; swatchClass: string }> = [
  {
    value: "none",
    label: "No color",
    swatchClass:
      "bg-[linear-gradient(135deg,hsl(var(--foreground)/0.18)_0%,hsl(var(--foreground)/0.18)_48%,transparent_48%,transparent_52%,hsl(var(--foreground)/0.18)_52%,hsl(var(--foreground)/0.18)_100%)]",
  },
  { value: "slate", label: "Slate", swatchClass: "bg-[hsl(210_55%_78%)] dark:bg-[hsl(215_25%_25%)]" },
  { value: "emerald", label: "Emerald", swatchClass: "bg-[hsl(152_50%_74%)] dark:bg-[hsl(156_30%_24%)]" },
  { value: "amber", label: "Amber", swatchClass: "bg-[hsl(42_85%_74%)] dark:bg-[hsl(35_30%_25%)]" },
  { value: "rose", label: "Rose", swatchClass: "bg-[hsl(345_60%_80%)] dark:bg-[hsl(345_25%_25%)]" },
];

const ThemeToggle = () => {
  const readThemeMode = (): ThemeMode => {
    if (typeof window === "undefined") {
      return "system";
    }

    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }

    return "system";
  };

  const resolveDarkFromMode = (mode: ThemeMode) => {
    if (typeof window === "undefined") {
      return false;
    }

    if (mode === "dark") {
      return true;
    }

    if (mode === "light") {
      return false;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readThemeMode());
  const [dark, setDark] = useState(() => resolveDarkFromMode(readThemeMode()));
  const [tint, setTint] = useState<BgTint>(() => {
    if (typeof window === "undefined") return "none";
    const saved = localStorage.getItem("bg-tint") as BgTint | null;
    return saved ?? "none";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("theme", themeMode);

    if (themeMode !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (event: MediaQueryListEvent) => {
      setDark(event.matches);
    };

    setDark(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-bg", tint);
    localStorage.setItem("bg-tint", tint);
  }, [tint]);

  useEffect(() => {
    const isValidTint = (value: string): value is BgTint =>
      tintOptions.some((option) => option.value === value);

    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (event.key === "theme") {
        if (event.newValue === "dark") {
          setThemeMode("dark");
          setDark(true);
        }

        if (event.newValue === "light") {
          setThemeMode("light");
          setDark(false);
        }

        if (event.newValue === "system") {
          setThemeMode("system");
          setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
      }

      if (event.key === "bg-tint") {
        const nextTint = event.newValue;
        if (nextTint && isValidTint(nextTint)) {
          setTint(nextTint);
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center p-0 text-foreground transition-transform transition-opacity duration-200 hover:scale-110 hover:opacity-80"
          aria-label="Theme and appearance options"
        >
          {dark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>

        <DropdownMenuItem
          onSelect={() => {
            const nextDark = !dark;
            setThemeMode(nextDark ? "dark" : "light");
            setDark(nextDark);
          }}
          className="gap-2"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{dark ? "Switch to Light" : "Switch to Dark"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => setThemeMode("system")} className="gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center text-xs">A</span>
          <span>Use Device Theme</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 pb-1 pt-1">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Palette className="h-3.5 w-3.5" />
            Background Tint
          </div>
          <div className="flex items-center gap-2">
            {tintOptions.map((option) => {
              const isActive = tint === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTint(option.value)}
                  className={`relative h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
                    isActive ? "border-foreground" : "border-border"
                  } ${option.swatchClass}`}
                  aria-label={`Set background tint to ${option.label}`}
                  title={option.label}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center text-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
