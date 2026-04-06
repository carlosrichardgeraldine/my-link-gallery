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
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });
  const [tint, setTint] = useState<BgTint>(() => {
    if (typeof window === "undefined") return "none";
    const saved = localStorage.getItem("bg-tint") as BgTint | null;
    return saved ?? "none";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-bg", tint);
    localStorage.setItem("bg-tint", tint);
  }, [tint]);

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

        <DropdownMenuItem onSelect={() => setDark((prev) => !prev)} className="gap-2">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{dark ? "Switch to Light" : "Switch to Dark"}</span>
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
