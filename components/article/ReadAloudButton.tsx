"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chunkTextForTts } from "@/lib/tts/chunkText";

type PlaybackState = "idle" | "loading" | "playing" | "paused";

function pickFemaleBrowserVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) =>
      /female|zira|samantha|aria|jenny|google uk english female|natasha|emma/i.test(
        v.name
      )
    ) ?? null
  );
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef(false);
  const chunksRef = useRef<string[]>([]);
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    cleanup();
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

  const playAudioBlob = useCallback((blob: Blob) => {
    return new Promise<void>((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        reject(new Error("Playback error"));
      };

      audio.play().catch(reject);
    });
  }, []);

  const playBrowserFallback = useCallback(
    (fromIndex: number) => {
      const remaining = chunksRef.current.slice(fromIndex).join(" ");
      if (!remaining.trim()) return;

      const synth = window.speechSynthesis;
      const utt = new SpeechSynthesisUtterance(remaining);
      const female = pickFemaleBrowserVoice();
      if (female) utt.voice = female;
      utt.rate = 1;
      utt.pitch = 1;
      utt.onend = () => {
        if (!abortRef.current) {
          setState("idle");
          setStatusLabel("");
          setProgress({ current: 0, total: 0 });
        }
      };
      setStatusLabel("Playing (browser voice)…");
      setState("playing");
      synth.speak(utt);
    },
    []
  );

  const runPremiumPlayback = useCallback(async () => {
    const chunks = chunksRef.current;
    let nextPreload: Promise<Blob | null> | null = fetchChunkAudio(chunks[0]);

    for (let i = 0; i < chunks.length; i++) {
      if (abortRef.current) return;

      setProgress({ current: i + 1, total: chunks.length });
      setStatusLabel(
        chunks.length > 1
          ? `Playing part ${i + 1} of ${chunks.length}…`
          : "Playing…"
      );

      const blob = await nextPreload;
      if (abortRef.current) return;

      if (!blob) {
        playBrowserFallback(i);
        return;
      }

      // Preload next chunk while current plays
      nextPreload =
        i + 1 < chunks.length ? fetchChunkAudio(chunks[i + 1]) : null;

      setState("playing");
      try {
        await playAudioBlob(blob);
      } catch {
        playBrowserFallback(i);
        return;
      }
    }

    if (!abortRef.current) {
      setState("idle");
      setStatusLabel("");
      setProgress({ current: 0, total: 0 });
    }
  }, [playAudioBlob, playBrowserFallback]);

  const start = useCallback(async () => {
    const trimmed = text?.trim();
    if (!trimmed) return;

    abortRef.current = false;
    cleanup();
    chunksRef.current = chunkTextForTts(trimmed);
    if (!chunksRef.current.length) return;

    setState("loading");
    setProgress({ current: 0, total: chunksRef.current.length });
    setStatusLabel(
      chunksRef.current.length > 1
        ? `Preparing ${chunksRef.current.length} parts…`
        : "Preparing voice…"
    );

    await runPremiumPlayback();
  }, [text, cleanup, runPremiumPlayback]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setState("paused");
      setStatusLabel("Paused");
      return;
    }
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setState("paused");
      setStatusLabel("Paused");
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setState("playing");
      setStatusLabel(
        progress.total > 1
          ? `Playing part ${progress.current} of ${progress.total}…`
          : "Playing…"
      );
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState("playing");
      setStatusLabel("Playing (browser voice)…");
    }
  }, [progress]);

  const isActive = state === "loading" || state === "playing" || state === "paused";

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
        {state === "idle" && "Human female voice · full article playback"}
      </p>
    </div>
  );
}
