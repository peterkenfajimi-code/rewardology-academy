import { NextResponse } from "next/server";
import { isElevenLabsConfigured } from "@/lib/env";
import { prepareTextForTts } from "@/lib/tts/prepareText";

export const runtime = "nodejs";

const MAX_CHARS = 10000;

/** Educational narration — stable, clear, slightly slower. */
const VOICE_SETTINGS = {
  stability: 0.58,
  similarity_boost: 0.78,
  style: 0,
  use_speaker_boost: true,
  speed: 0.94,
};

export async function GET() {
  return NextResponse.json({
    available: isElevenLabsConfigured(),
    voiceId: process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL",
    model: "eleven_multilingual_v2",
  });
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const prepared = prepareTextForTts(text, true);
    const trimmed = prepared.trim().slice(0, MAX_CHARS);
    if (!trimmed) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";

    if (!apiKey) {
      return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: "eleven_multilingual_v2",
          voice_settings: VOICE_SETTINGS,
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("ElevenLabs TTS error:", detail);
      return NextResponse.json({ error: "TTS provider failed" }, { status: 500 });
    }

    const audio = await response.arrayBuffer();
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
