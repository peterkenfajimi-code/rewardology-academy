"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadBrowserVoices, pickBrowserVoice } from "@/lib/tts/browserVoice";
import { chunkTextForBrowser, chunkTextForTts } from "@/lib/tts/chunkText";
import { GaplessAudioPlayer } from "@/lib/tts/gaplessPlayer";
import { prepareTextForTts } from "@/lib/tts/prepareText";

type PlaybackState = "idle" | "loading" | "playing" | "paused";
type Engine = "premium" | "browser" | null;

async function fetchTtsStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/tts", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { available?: boolean };
    return Boolean(data.available);
  } catch {
    return false;
  }
}

async function fetchChunkAudio(text: string): Promise<Blob | null> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return null;
  return res.blob();
}

export function ReadAloudButton({ text }: { text: string }) {
  const [state, setState] = useState<PlaybackState>("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusLabel, setStatusLabel] = useState("");
  const [premiumAvailable, setPremiumAvailable] = useState<boolean | null>(null);
  const [voiceName, setVoiceName] = useState("");

  const engineRef = useRef<Engine>(null);
  const abortRef = useRef(false);
  const chunksRef = useRef<string[]>([]);
  const browserIdxRef = useRef(0);
  const browserVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const playerRef = useRef<GaplessAudioPlayer | null>(null);

  useEffect(() => {
    void fetchTtsStatus().then(setPremiumAvailable);
    void loadBrowserVoices().then((voices) => {
      const voice = pickBrowserVoice(voices);
      browserVoiceRef.current = voice;
      if (voice) setVoiceName(voice.name);
    });
  }, []);

  const cleanup = useCallback(() => {
    playerRef.current?.stop();
    playerRef.current = null;
    window.speechSynthesis.cancel();
    browserIdxRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    cleanup();
    engineRef.current = null;
    chunksRef.current = [];
    setState("idle");
    setProgress({ current: 0, total: 0 });
    setStatusLabel("");
  }, [cleanup]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  const speakBrowserNext = useCallback(() => {
    const chunks = chunksRef.current;
    const idx = browserIdxRef.current;

    if (abortRef.current || idx >= chunks.length) {
      if (!abortRef.current) {
        setState("idle");
        setStatusLabel("");
        setProgress({ current: 0, total: 0 });
        engineRef.current = null;
      }
      return;
    }

    setProgress({ current: idx + 1, total: chunks.length });
    setStatusLabel(
      chunks.length > 1
        ? `Reading segment ${idx + 1} of ${chunks.length}${voiceName ? ` · ${voiceName}` : ""}`
        : voiceName
          ? `Reading · ${voiceName}`
          : "Reading…"
    );
    setState("playing");

    const utt = new SpeechSynthesisUtterance(chunks[idx]);
    const voice = browserVoiceRef.current;
    if (voice) utt.voice = voice;
    utt.rate = 0.92;
    utt.pitch = 1.02;
    utt.volume = 1;

    utt.onend = () => {
      if (abortRef.current) return;
      browserIdxRef.current = idx + 1;
      speakBrowserNext();
    };
    utt.onerror = () => {
      if (abortRef.current) return;
      browserIdxRef.current = idx + 1;
      speakBrowserNext();
    };

    window.speechSynthesis.speak(utt);
  }, [voiceName]);

  const runBrowserPlayback = useCallback(async () => {
    engineRef.current = "browser";
    const voices = await loadBrowserVoices();
    const voice = pickBrowserVoice(voices);
    browserVoiceRef.current = voice;
    if (voice) setVoiceName(voice.name);

    browserIdxRef.current = 0;
    speakBrowserNext();
  }, [speakBrowserNext]);

  const runPremiumPlayback = useCallback(async () => {
    engineRef.current = "premium";
    const chunks = chunksRef.current;
    const player = new GaplessAudioPlayer();
    playerRef.current = player;
    player.reset();

    let nextPreload: Promise<Blob | null> | null = fetchChunkAudio(chunks[0]);

    for (let i = 0; i < chunks.length; i++) {
      if (abortRef.current) return;

      setProgress({ current: i + 1, total: chunks.length });
      setStatusLabel(
        chunks.length > 1
          ? `Playing part ${i + 1} of ${chunks.length} · premium voice`
          : "Playing · premium voice"
      );

      const blob = await nextPreload;
      if (abortRef.current) return;

      if (!blob) {
        await runBrowserPlayback();
        return;
      }

      nextPreload = i + 1 < chunks.length ? fetchChunkAudio(chunks[i + 1]) : null;

      setState("playing");
      try {
        await player.playBlob(blob);
      } catch {
        await runBrowserPlayback();
        return;
      }
    }

    if (!abortRef.current) {
      setState("idle");
      setStatusLabel("");
      setProgress({ current: 0, total: 0 });
      engineRef.current = null;
    }
  }, [runBrowserPlayback]);

  const start = useCallback(async () => {
    const trimmed = text?.trim();
    if (!trimmed) return;

    abortRef.current = false;
    cleanup();

    const prepared = prepareTextForTts(trimmed, false);
    const usePremium = premiumAvailable ?? (await fetchTtsStatus());

    if (usePremium) {
      chunksRef.current = chunkTextForTts(prepared);
    } else {
      chunksRef.current = chunkTextForBrowser(prepared);
    }

    if (!chunksRef.current.length) return;

    setState("loading");
    setProgress({ current: 0, total: chunksRef.current.length });
    setStatusLabel(
      usePremium
        ? chunksRef.current.length > 1
          ? `Preparing ${chunksRef.current.length} parts…`
          : "Preparing premium voice…"
        : "Preparing natural voice…"
    );

    if (usePremium) {
      await runPremiumPlayback();
    } else {
      await runBrowserPlayback();
    }
  }, [text, cleanup, premiumAvailable, runPremiumPlayback, runBrowserPlayback]);

  const pause = useCallback(() => {
    if (engineRef.current === "premium" && playerRef.current) {
      playerRef.current.pause();
      setState("paused");
      setStatusLabel("Paused");
      return;
    }
    if (engineRef.current === "browser" && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setState("paused");
      setStatusLabel("Paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (engineRef.current === "premium" && playerRef.current) {
      playerRef.current.resume();
      setState("playing");
      setStatusLabel(
        progress.total > 1
          ? `Playing part ${progress.current} of ${progress.total} · premium voice`
          : "Playing · premium voice"
      );
      return;
    }
    if (engineRef.current === "browser" && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState("playing");
    }
  }, [progress]);

  const isActive = state === "loading" || state === "playing" || state === "paused";

  const idleHint =
    premiumAvailable === true
      ? "Premium human voice · full article playback"
      : premiumAvailable === false
        ? voiceName
          ? `Natural voice · ${voiceName}`
          : "Natural browser voice · full article playback"
        : "Loading voice engine…";

  return (
    <div className="ess-ra-wrap">
      <div className="ess-ra-actions">
        {!isActive ? (
          <button
            type="button"
            onClick={start}
            disabled={!text?.trim()}
            className="ess-ra-btn ess-ra-btn-primary"
          >
            Read aloud
          </button>
        ) : (
          <>
            {state === "playing" && (
              <button type="button" onClick={pause} className="ess-ra-btn">
                Pause
              </button>
            )}
            {state === "paused" && (
              <button type="button" onClick={resume} className="ess-ra-btn">
                Resume
              </button>
            )}
            <button type="button" onClick={reset} className="ess-ra-btn ess-ra-btn-danger">
              Stop
            </button>
          </>
        )}
      </div>

      <p className="ess-ra-status">
        {state === "loading" && (statusLabel || "Preparing voice…")}
        {state === "playing" && (statusLabel || "Playing…")}
        {state === "paused" && (statusLabel || "Paused")}
        {state === "idle" && idleHint}
      </p>
    </div>
  );
}
