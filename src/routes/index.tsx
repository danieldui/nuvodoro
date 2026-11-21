import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tomato — Pomodoro Timer" },
      { name: "description", content: "A calm pomodoro timer for focused work and short breaks." },
      { property: "og:title", content: "Tomato — Pomodoro Timer" },
      { property: "og:description", content: "A calm pomodoro timer for focused work and short breaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const MODES = { focus: { label: "Focus", min: 25 }, short: { label: "Short break", min: 5 }, long: { label: "Long break", min: 15 } } as const;
type Mode = keyof typeof MODES;

function Index() {
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(MODES.focus.min * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const ref = useRef<number | null>(null);

  const switchTo = (m: Mode) => { setMode(m); setLeft(MODES[m].min * 60); setRunning(false); };

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  useEffect(() => {
    if (left > 0) return;
    try { const c = new AudioContext(); const o = c.createOscillator(); o.connect(c.destination); o.start(); o.stop(c.currentTime + 0.4); } catch {}
    if (mode === "focus") { const n = done + 1; setDone(n); switchTo(n % 4 === 0 ? "long" : "short"); }
    else switchTo("focus");
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  useEffect(() => { document.title = `${mm}:${ss} · ${MODES[mode].label}`; }, [mm, ss, mode]);
  const pct = 1 - left / (MODES[mode].min * 60);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-4 font-serif text-foreground">
      <h1 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Tomato</h1>
      <div className="flex gap-2 rounded-full bg-secondary p-1">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button key={m} onClick={() => switchTo(m)}
            className={`rounded-full px-4 py-2 text-sm transition ${mode === m ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-accent"}`}>
            {MODES[m].label}
          </button>
        ))}
      </div>
      <div className="relative flex h-72 w-72 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(var(--primary) ${pct * 360}deg, var(--muted) 0)` }}>
        <div className="flex h-64 w-64 items-center justify-center rounded-full bg-background">
          <span className="text-7xl tabular-nums">{mm}:{ss}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setRunning((r) => !r)} className="rounded-full bg-primary px-8 py-3 text-primary-foreground hover:opacity-90">
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => switchTo(mode)} className="rounded-full border border-border px-6 py-3 hover:bg-accent">Reset</button>
      </div>
      <p className="text-sm text-muted-foreground">Pomodoros completed: {done}</p>
    </main>
  );
}
