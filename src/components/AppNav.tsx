import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Clock,
  Cpu,
  FileText,
  Gamepad2,
  GraduationCap,
  Grid2X2,
  Image,
  Link2,
  Newspaper,
  Wrench,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type NavItem =
  | { label: string; href: string; icon: React.ElementType; soon?: false }
  | { label: string; href: null; icon: React.ElementType; soon: true };

const navItems: NavItem[] = [
  { label: "Resume", href: "/", icon: FileText },
  { label: "Links", href: "/links", icon: Link2 },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "Pomodoro", href: "/pomodoro", icon: Clock },
  { label: "Flashcard", href: null, icon: GraduationCap, soon: true },
  { label: "exploreIT", href: null, icon: Cpu, soon: true },
  { label: "Blog", href: null, icon: Newspaper, soon: true },
  { label: "Memes", href: null, icon: Image, soon: true },
  { label: "Games", href: null, icon: Gamepad2, soon: true },
];

const AppNav = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:bottom-6 md:right-6"
        >
          <Grid2X2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-56 p-2"
        aria-label="Navigation menu"
      >
        <div role="navigation" aria-label="App pages">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Navigate
          </p>
          <div className="grid grid-cols-3 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href !== null && location.pathname === item.href;

              if (item.soon) {
                return (
                  <div
                    key={item.label}
                    title={`${item.label} — coming soon`}
                    aria-label={`${item.label}, coming soon`}
                    className="flex cursor-not-allowed flex-col items-center gap-1 rounded-xl p-2 text-center opacity-35 select-none"
                  >
                    <Icon className="h-4 w-4 text-foreground" />
                    <span className="text-[9px] font-medium leading-none text-foreground">
                      {item.label}
                    </span>
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                      soon
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive ? "bg-muted" : ""
                  }`}
                >
                  <Icon className="h-4 w-4 text-foreground" />
                  <span
                    className={`text-[9px] leading-none text-foreground ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppNav;
