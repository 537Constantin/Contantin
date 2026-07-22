"use client";

import * as React from "react";
import {
  ShieldCheck, ShieldAlert, Play, Square, Loader2, MonitorUp, Camera,
  MessageSquareText, Download, AlertTriangle, Info, Volume2, VolumeX, EyeOff,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  VERDICT_META, SENSITIVITY_META, verdictAt,
  type ModerationResult, type Verdict, type Sensitivity,
} from "@/lib/moderation";
import { tapHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Source = "screen" | "camera";

interface LogEvent {
  id: string;
  time: string;
  verdict: Verdict;
  label: string;
  score: number;
  thumb: string;
}

/** Short alarm beep via WebAudio – no asset needed. */
function alarmBeep() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
    osc.onended = () => ctx.close().catch(() => {});
  } catch { /* audio not available */ }
}

/** Grab a downscaled JPEG frame from a <video> element. */
function captureFrame(video: HTMLVideoElement, maxW = 512): string | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const scale = Math.min(1, maxW / w);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.5);
}

export default function SecurityPage() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlight = React.useRef(false);

  const prevVerdict = React.useRef<Verdict>("safe");

  const [source, setSource] = React.useState<Source>("screen");
  const [intervalSec, setIntervalSec] = React.useState(3);
  const [sensitivity, setSensitivity] = React.useState<Sensitivity>("medium");
  const [soundOn, setSoundOn] = React.useState(true);
  const [hideOnDanger, setHideOnDanger] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [current, setCurrent] = React.useState<ModerationResult | null>(null);
  const [currentVerdict, setCurrentVerdict] = React.useState<Verdict>("safe");
  const [log, setLog] = React.useState<LogEvent[]>([]);
  const [error, setError] = React.useState("");

  // Latest settings for the sampling loop (which closes over the first render).
  const settings = React.useRef({ sensitivity, soundOn });
  settings.current = { sensitivity, soundOn };

  const [text, setText] = React.useState("");
  const [textResult, setTextResult] = React.useState<ModerationResult | null>(null);
  const [checkingText, setCheckingText] = React.useState(false);

  const stop = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
  }, []);

  React.useEffect(() => stop, [stop]);

  async function sampleOnce() {
    if (inFlight.current || !videoRef.current) return;
    const frame = captureFrame(videoRef.current);
    if (!frame) return;
    inFlight.current = true;
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "Moderation fehlgeschlagen.");
        return;
      }
      const result = j as ModerationResult;
      const verdict = verdictAt(result.top, result.flagged, settings.current.sensitivity);
      setCurrent(result);
      setCurrentVerdict(verdict);

      if (verdict !== "safe") {
        tapHaptic(verdict === "blocked" ? 20 : 12);
        // Alarm only when entering a worse state, so it doesn't beep every tick.
        const worsened = prevVerdict.current === "safe" || (prevVerdict.current === "warning" && verdict === "blocked");
        if (settings.current.soundOn && worsened) alarmBeep();
        const top = result.top[0];
        setLog((l) => [
          {
            id: crypto.randomUUID?.() ?? String(Date.now()),
            time: new Date().toLocaleTimeString("de-DE"),
            verdict,
            label: top?.label ?? "—",
            score: top?.score ?? 0,
            thumb: frame,
          },
          ...l,
        ].slice(0, 100));
      }
      prevVerdict.current = verdict;
    } catch {
      setError("Verbindung fehlgeschlagen.");
    } finally {
      inFlight.current = false;
    }
  }

  async function start() {
    setError("");
    tapHaptic();
    try {
      const stream =
        source === "screen"
          ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
          : await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      // Stop cleanly if the user ends the screen share from the browser UI.
      stream.getVideoTracks()[0]?.addEventListener("ended", stop);
      setRunning(true);
      setCurrent(null);
      setCurrentVerdict("safe");
      prevVerdict.current = "safe";
      void sampleOnce();
      timerRef.current = setInterval(sampleOnce, intervalSec * 1000);
    } catch (err) {
      const denied = (err as Error)?.name === "NotAllowedError";
      setError(denied ? "Zugriff abgelehnt. Bitte Freigabe erlauben." : "Quelle konnte nicht gestartet werden.");
    }
  }

  async function checkText() {
    if (!text.trim() || checkingText) return;
    setCheckingText(true);
    setError("");
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const j = await res.json();
      if (!res.ok) setError(j.error ?? "Prüfung fehlgeschlagen.");
      else setTextResult(j as ModerationResult);
    } catch {
      setError("Verbindung fehlgeschlagen.");
    } finally {
      setCheckingText(false);
    }
  }

  function downloadLog() {
    const blob = new Blob([JSON.stringify(log.map(({ thumb, ...e }) => e), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moderation-protokoll-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const v = VERDICT_META[currentVerdict];
  const blockedNow = running && currentVerdict === "blocked" && hideOnDanger;

  return (
    <PageShell>
      <PageHeader
        title="Sicherheit & Live-Moderation"
        description="Überwacht Video (z. B. dein Zoom-Fenster) und Chat live auf gefährliche & NSFW-Inhalte."
      >
        {running ? (
          <Button variant="outline" size="sm" onClick={stop}>
            <Square className="h-4 w-4" /> Stoppen
          </Button>
        ) : (
          <Button variant="accent" size="sm" onClick={start}>
            <Play className="h-4 w-4" /> Live starten
          </Button>
        )}
      </PageHeader>

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2.5 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live monitor */}
        <div className="space-y-4 lg:col-span-2">
          {!running && (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Quelle</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSource("screen")}
                      className={cn("flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors", source === "screen" ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink")}
                    >
                      <MonitorUp className="h-4 w-4" /> Bildschirm / Zoom-Fenster
                    </button>
                    <button
                      onClick={() => setSource("camera")}
                      className={cn("flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors", source === "camera" ? "bg-ink text-canvas" : "bg-surface-soft text-ink-soft hover:text-ink")}
                    >
                      <Camera className="h-4 w-4" /> Kamera
                    </button>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Prüf-Intervall</p>
                  <div className="flex gap-2">
                    {[2, 3, 5, 10].map((s) => (
                      <button
                        key={s}
                        onClick={() => setIntervalSec(s)}
                        className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", intervalSec === s ? "bg-accent/15 text-accent ring-1 ring-accent/25" : "bg-surface-soft text-ink-soft hover:text-ink")}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Empfindlichkeit</p>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as Sensitivity[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSensitivity(s)}
                        className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", sensitivity === s ? "bg-accent/15 text-accent ring-1 ring-accent/25" : "bg-surface-soft text-ink-soft hover:text-ink")}
                      >
                        {SENSITIVITY_META[s].label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted">Höher = schlägt schon bei geringerem Verdacht an.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSoundOn((v) => !v)}
                    className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", soundOn ? "bg-accent/15 text-accent ring-1 ring-accent/25" : "bg-surface-soft text-ink-soft hover:text-ink")}
                  >
                    {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} Alarm-Ton
                  </button>
                  <button
                    onClick={() => setHideOnDanger((v) => !v)}
                    className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", hideOnDanger ? "bg-accent/15 text-accent ring-1 ring-accent/25" : "bg-surface-soft text-ink-soft hover:text-ink")}
                  >
                    <EyeOff className="h-4 w-4" /> Bei Gefahr ausblenden
                  </button>
                </div>
                <p className="flex items-start gap-1.5 text-xs text-muted">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Bei Bildschirm-Freigabe im Dialog dein Zoom-Fenster wählen. Frames werden zur Prüfung an die
                  Moderations-KI gesendet und nicht dauerhaft gespeichert.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="relative overflow-hidden rounded-xl bg-black/80">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video ref={videoRef} muted playsInline className={cn("mx-auto max-h-[340px] w-full object-contain", !running && "hidden", blockedNow && "blur-2xl")} />
                {!running && (
                  <div className="flex h-56 items-center justify-center text-sm text-muted">
                    Noch keine Live-Quelle – oben auf Live starten tippen.
                  </div>
                )}
                {blockedNow && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-danger/25 text-center backdrop-blur-xl">
                    <EyeOff className="h-8 w-8 text-white" />
                    <p className="text-sm font-semibold text-white">Inhalt blockiert</p>
                    <p className="text-xs text-white/80">Gefährlicher/NSFW-Inhalt erkannt – Bild ausgeblendet</p>
                  </div>
                )}
                {running && (
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">
                    <span className={cn("h-2 w-2 rounded-full", v.dot)} />
                    <span className="text-xs font-semibold text-white">{v.label}</span>
                  </div>
                )}
              </div>

              {current && (
                <div className="mt-4">
                  <div className={cn("mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold", v.cls)}>
                    {currentVerdict === "safe" ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                    {v.label}
                  </div>
                  <div className="space-y-1.5">
                    {current.top.slice(0, 5).map((c) => (
                      <div key={c.key} className="flex items-center gap-2">
                        <span className="w-40 shrink-0 truncate text-xs text-ink-soft">{c.label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-soft">
                          <div
                            className={cn("h-full rounded-full", c.score >= 0.5 ? "bg-danger" : c.score >= 0.3 ? "bg-warning" : "bg-success")}
                            style={{ width: `${Math.min(100, Math.round(c.score * 100))}%` }}
                          />
                        </div>
                        <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-muted">{Math.round(c.score * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat / text filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><MessageSquareText className="h-4 w-4 text-accent" /> Chat-/Text-Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Chat-Nachricht einfügen und prüfen …"
                className="w-full resize-y rounded-xl border border-border bg-surface-soft/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
              />
              <Button variant="accent" size="sm" onClick={checkText} disabled={checkingText || !text.trim()}>
                {checkingText ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Text prüfen
              </Button>
              {textResult && (() => {
                const tv = verdictAt(textResult.top, textResult.flagged, sensitivity);
                return (
                  <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold", VERDICT_META[tv].cls)}>
                    {tv === "safe" ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                    {VERDICT_META[tv].label}
                    {textResult.top[0] && tv !== "safe" && <span className="font-normal">· {textResult.top[0].label}</span>}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Event log */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ereignis-Protokoll</CardTitle>
              {log.length > 0 && (
                <Button variant="outline" size="sm" onClick={downloadLog}>
                  <Download className="h-4 w-4" /> Export
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {log.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">Noch keine Auffälligkeiten erkannt.</p>
              ) : (
                <div className="max-h-[520px] space-y-2 overflow-y-auto">
                  {log.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={e.thumb} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 shrink-0 rounded-full", VERDICT_META[e.verdict].dot)} />
                          <span className="truncate text-sm font-medium text-ink">{e.label}</span>
                        </div>
                        <p className="text-xs text-muted">{e.time} · {Math.round(e.score * 100)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="mt-3 flex items-start gap-1.5 px-1 text-[11px] leading-relaxed text-muted">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" />
            Datenschutz: Wenn echte Personen zu sehen sind, brauchst du deren Einwilligung. Die Analyse erfolgt
            über die Moderations-KI (OpenAI); die automatische Einstufung kann Fehler machen – bitte im Zweifel
            selbst prüfen.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
