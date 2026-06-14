"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadBrowserVoices, pickBrowserVoice } from "@/lib/tts/browserVoice";
import "@/styles/voice-bar.css";

type VoiceState = "idle" | "playing" | "paused";

export function BrowserVoiceBar({
  text,
  title = "Listen",
  className = "q-voice-bar",
}: {
  text: string;
  title?: string;
  className?: string;
}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [voiceName, setVoiceName] = useState("");
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    void loadBrowserVoices().then((voices) => {
      const v = pickBrowserVoice(voices);
      voiceRef.current = v;
      if (v) setVoiceName(v.name);
    });
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState("idle");
  }, []);

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const speak = useCallback(() => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(trimmed);
    if (voiceRef.current) utt.voice = voiceRef.current;
    utt.rate = 0.92;
    utt.pitch = 1.02;
    utt.onend = () => setState("idle");
    utt.onerror = () => setState("idle");
    setState("playing");
    window.speechSynthesis.speak(utt);
  }, [text]);

  const toggle = useCallback(() => {
    if (state === "playing") {
      window.speechSynthesis.pause();
      setState("paused");
      return;
    }
    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }
    speak();
  }, [state, speak]);

  if (!text?.trim()) return null;

  const status =
    state === "playing"
      ? `Reading · ${voiceName || "voice"}`
      : state === "paused"
        ? "Paused"
        : voiceName
          ? `${voiceName} ready`
          : "Natural voice ready";

  return (
    <div className={className}>
      <div style={{ fontSize: 20 }} aria-hidden>
        🔊
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{title}</div>
        <div className="qvb-label">{status}</div>
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <button type="button" className="qvb-btn qvb-play" onClick={toggle}>
          {state === "playing" ? "⏸ Pause" : state === "paused" ? "▶ Resume" : "▶ Play"}
        </button>
        <button type="button" className="qvb-btn qvb-stop" onClick={stop}>
          ■ Stop
        </button>
      </div>
    </div>
  );
}
