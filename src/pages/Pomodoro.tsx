import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ThemeToggle from "@/components/ThemeToggle";

const timerPresets = [
  {
    id: "classic",
    label: "25 min focus / 5 min break",
    description: "The classic Pomodoro cycle - ideal for most tasks.",
    focusMinutes: 25,
    breakMinutes: 5,
  },
  {
    id: "deep-work",
    label: "50 min focus / 10-17 min break",
    description: "Known as the 52/17 or 50/10 method - great for deep work.",
    focusMinutes: 50,
    breakMinutes: 10,
  },
  {
    id: "study",
    label: "45 min focus / 15 min break",
    description: "Popular for study sessions and warm-up deep work.",
    focusMinutes: 45,
    breakMinutes: 15,
  },
  {
    id: "flex",
    label: "30 min focus / 5 min break",
    description: "A lighter, more flexible block for moderate tasks.",
    focusMinutes: 30,
    breakMinutes: 5,
  },
  {
    id: "sprint",
    label: "15-20 min focus / 3-5 min break",
    description: "Short sprints for quick tasks or low-energy moments.",
    focusMinutes: 15,
    breakMinutes: 3,
  },
] as const;

const breakStartMessages = [
  "Nice job, take a soft little pause.",
  "Great focus, enjoy a quick breather.",
  "Well done, let your mind stretch for a moment.",
  "You made progress, now rest for a bit.",
  "Good work, take a gentle break.",
  "Solid effort, give yourself a moment of ease.",
  "You showed up well, enjoy this short pause.",
  "Nice session, let your thoughts settle for a minute.",
  "You did great, take a light break.",
  "Good flow, now let yourself unwind briefly.",
] as const;

const focusResumeMessages = [
  "Welcome back, your momentum is waiting for you.",
  "Let's slip gently into focus again.",
  "You're doing great, let's keep the flow going.",
  "Ready when you are, your next step is right here.",
  "A fresh breath, a fresh start. Let's continue.",
  "You've got this, one calm session at a time.",
  "Back to the rhythm, steady and smooth.",
  "Your focus is warming up again, let's follow it.",
  "Here we go, another small step forward.",
  "Let's return to the quiet groove you built.",
] as const;

const cycleEndMessages = [
  "Nice work today, take a breath and enjoy the pause.",
  "Session complete, you've earned a moment of calm.",
  "Well done, let your mind rest for a bit.",
  "Great focus, now give yourself some ease.",
  "You showed up beautifully, time to unwind.",
  "Another step forward, now relax your shoulders.",
  "Good progress, let the quiet settle in.",
  "You did your part, now let the world slow down.",
  "Solid session, enjoy the space you've created.",
  "Nice effort, let yourself drift into a soft break.",
] as const;

const pickRandomMessage = (messages: readonly string[]) =>
  messages[Math.floor(Math.random() * messages.length)] ?? "";

const Pomodoro = () => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [manualFocusMinutes, setManualFocusMinutes] = useState("25");
  const [manualBreakMinutes, setManualBreakMinutes] = useState("5");
  const [cycleTarget, setCycleTarget] = useState(4);
  const [manualCycles, setManualCycles] = useState("4");
  const [completedCycles, setCompletedCycles] = useState(0);
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [isNotificationMuted, setIsNotificationMuted] = useState(false);
  const [showOverlayMessage, setShowOverlayMessage] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");

  const focusStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionEndedAudioRef = useRef<HTMLAudioElement | null>(null);
  const overlayHideTimeoutRef = useRef<number | null>(null);
  const previousPhaseRef = useRef<"focus" | "break">("focus");
  const previousRunningRef = useRef(false);

  useEffect(() => {
    const focusAudio = new Audio("/focus-start.mp3");
    const breakAudio = new Audio("/break.mp3");
    const sessionEndedAudio = new Audio("/session-ended.mp3");
    focusAudio.preload = "auto";
    breakAudio.preload = "auto";
    sessionEndedAudio.preload = "auto";
    focusAudio.volume = 0.5;
    breakAudio.volume = 0.5;
    sessionEndedAudio.volume = 0.5;
    focusAudio.muted = isNotificationMuted;
    breakAudio.muted = isNotificationMuted;
    sessionEndedAudio.muted = isNotificationMuted;
    focusStartAudioRef.current = focusAudio;
    breakStartAudioRef.current = breakAudio;
    sessionEndedAudioRef.current = sessionEndedAudio;

    return () => {
      focusAudio.pause();
      breakAudio.pause();
      sessionEndedAudio.pause();
      focusStartAudioRef.current = null;
      breakStartAudioRef.current = null;
      sessionEndedAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (focusStartAudioRef.current) focusStartAudioRef.current.muted = isNotificationMuted;
    if (breakStartAudioRef.current) breakStartAudioRef.current.muted = isNotificationMuted;
    if (sessionEndedAudioRef.current) sessionEndedAudioRef.current.muted = isNotificationMuted;
  }, [isNotificationMuted]);

  useEffect(() => {
    return () => {
      if (overlayHideTimeoutRef.current) {
        window.clearTimeout(overlayHideTimeoutRef.current);
      }
    };
  }, []);

  const playNotification = (audio: HTMLAudioElement | null) => {
    if (!audio || isNotificationMuted) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  };

  const showTimerOverlayMessage = useCallback((message: string) => {
    if (!message) return;
    if (overlayHideTimeoutRef.current) {
      window.clearTimeout(overlayHideTimeoutRef.current);
      overlayHideTimeoutRef.current = null;
    }
    setOverlayMessage(message);
    setShowOverlayMessage(true);
    overlayHideTimeoutRef.current = window.setTimeout(() => {
      setShowOverlayMessage(false);
      overlayHideTimeoutRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          if (phase === "focus") {
            const nextCompletedCycles = completedCycles + 1;
            setCompletedCycles(nextCompletedCycles);

            if (nextCompletedCycles >= cycleTarget) {
              window.clearInterval(timer);
              setIsRunning(false);
              setPhase("focus");
              playNotification(sessionEndedAudioRef.current);
              showTimerOverlayMessage(pickRandomMessage(cycleEndMessages));
              return 0;
            }

            setPhase("break");
            return breakMinutes * 60;
          }

          setPhase("focus");
          return focusMinutes * 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [breakMinutes, completedCycles, cycleTarget, focusMinutes, isRunning, phase, isNotificationMuted, showTimerOverlayMessage]);

  useEffect(() => {
    const isSessionStart =
      isRunning && phase === "focus" && completedCycles === 0 && remainingSeconds === focusMinutes * 60;
    if (!isSessionStart) return;
    showTimerOverlayMessage("Session started. Good luck!");
  }, [completedCycles, focusMinutes, isRunning, phase, remainingSeconds, showTimerOverlayMessage]);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    const wasRunning = previousRunningRef.current;

    if (!wasRunning && isRunning && phase === "focus") {
      playNotification(focusStartAudioRef.current);
    }

    if (wasRunning && previousPhase === "focus" && phase === "break") {
      playNotification(breakStartAudioRef.current);
      showTimerOverlayMessage(pickRandomMessage(breakStartMessages));
    }

    if (wasRunning && previousPhase === "break" && phase === "focus" && isRunning) {
      playNotification(focusStartAudioRef.current);
      showTimerOverlayMessage(pickRandomMessage(focusResumeMessages));
    }

    previousPhaseRef.current = phase;
    previousRunningRef.current = isRunning;
  }, [isRunning, phase, showTimerOverlayMessage]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  const displayedCycle = useMemo(() => {
    if (phase === "break") return Math.max(1, Math.min(completedCycles, cycleTarget));
    return Math.max(1, Math.min(completedCycles + 1, cycleTarget));
  }, [completedCycles, cycleTarget, phase]);

  const selectedPresetId = useMemo(() => {
    const match = timerPresets.find(
      (p) => p.focusMinutes === focusMinutes && p.breakMinutes === breakMinutes
    );
    return match?.id ?? timerPresets[0].id;
  }, [focusMinutes, breakMinutes]);

  const selectPreset = (focus: number, rest: number) => {
    setFocusMinutes(focus);
    setManualFocusMinutes(String(focus));
    setBreakMinutes(rest);
    setManualBreakMinutes(String(rest));
    setCycleTarget(4);
    setManualCycles("4");
    setCompletedCycles(0);
    setPhase("focus");
    setRemainingSeconds(focus * 60);
    setIsRunning(false);
  };

  const applyManualTimer = () => {
    const parsedFocus = Number(manualFocusMinutes);
    const parsedBreak = Number(manualBreakMinutes);
    const parsedCycles = Number(manualCycles);

    if (!Number.isFinite(parsedFocus) || !Number.isFinite(parsedBreak) || !Number.isFinite(parsedCycles)) return;

    const normalizedFocus = Math.min(240, Math.max(1, Math.round(parsedFocus)));
    const normalizedBreak = Math.min(60, Math.max(1, Math.round(parsedBreak)));
    const normalizedCycles = Math.min(20, Math.max(1, Math.round(parsedCycles)));

    setFocusMinutes(normalizedFocus);
    setBreakMinutes(normalizedBreak);
    setCycleTarget(normalizedCycles);
    setManualFocusMinutes(String(normalizedFocus));
    setManualBreakMinutes(String(normalizedBreak));
    setManualCycles(String(normalizedCycles));
    setCompletedCycles(0);
    setPhase("focus");
    setRemainingSeconds(normalizedFocus * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setRemainingSeconds(focusMinutes * 60);
    setCompletedCycles(0);
    setPhase("focus");
    setIsRunning(false);
  };

  return (
    <div className="relative isolate min-h-screen bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4 md:h-16">
            <h1 className="text-base font-semibold text-foreground md:text-2xl">Pomodoro</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="mx-auto max-w-lg">
            <article className="hover-chroma-border rounded-2xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold text-foreground">Pomodoro Timer</h2>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Preset
                  <div className="relative mt-1">
                    <select
                      value={selectedPresetId}
                      onChange={(event) => {
                        const preset = timerPresets.find((item) => item.id === event.target.value);
                        if (preset) selectPreset(preset.focusMinutes, preset.breakMinutes);
                      }}
                      className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-10 text-sm font-normal tracking-normal text-foreground"
                    >
                      {timerPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  {timerPresets.find((p) => p.id === selectedPresetId)?.description ?? "Using custom timer values."}
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-[auto_auto_auto_auto] sm:items-end">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Focus (1-240 min)
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={manualFocusMinutes}
                    onChange={(e) => setManualFocusMinutes(e.target.value)}
                    className="mt-1 h-10 w-32 rounded-xl border border-border bg-background px-3 text-sm font-normal tracking-normal text-foreground"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Break (1-60 min)
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={manualBreakMinutes}
                    onChange={(e) => setManualBreakMinutes(e.target.value)}
                    className="mt-1 h-10 w-32 rounded-xl border border-border bg-background px-3 text-sm font-normal tracking-normal text-foreground"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Cycles (1-20)
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={manualCycles}
                    onChange={(e) => setManualCycles(e.target.value)}
                    className="mt-1 h-10 w-28 rounded-xl border border-border bg-background px-3 text-sm font-normal tracking-normal text-foreground"
                  />
                </label>
                <button
                  type="button"
                  onClick={applyManualTimer}
                  className="h-10 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
                >
                  Apply
                </button>
              </div>

              <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-background px-4 py-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {phase === "focus" ? "Focus" : "Break"} • Cycle {displayedCycle}/{cycleTarget}
                </p>
                <p className="mt-2 text-6xl font-bold tracking-wide text-foreground md:text-7xl">
                  {timeLabel}
                </p>
                <div
                  className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-background/90 px-4 transition-opacity duration-300 ${
                    showOverlayMessage ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!showOverlayMessage}
                >
                  <p className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    {overlayMessage}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRunning((current) => !current)}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-card"
                  >
                    {isRunning ? "Pause" : "Start"}
                  </button>
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-card"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNotificationMuted((current) => !current)}
                    aria-label={isNotificationMuted ? "Unmute notification sounds" : "Mute notification sounds"}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-card"
                  >
                    {isNotificationMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {isNotificationMuted ? "Unmute" : "Mute"}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
