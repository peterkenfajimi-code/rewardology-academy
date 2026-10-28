import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isElevenLabsConfigured, isSupabaseConfigured } from "@/lib/env";
import {
  clientIp,
  consumeSharedRateLimit,
  rateLimitResponse,
} from "@/lib/security/rateLimit";
import { prepareTextForTts } from "@/lib/tts/prepareText";
import {
  DEFAULT_ELEVENLABS_VOICE_ID,
  DEFAULT_ELEVENLABS_VOICE_NAME,
} from "@/lib/tts/voiceConfig";

export const runtime = "nodejs";

const MAX_CHARS = 4000;
const USER_LIMIT = 20;
const IP_LIMIT = 30;
const WINDOW_MS = 15 * 60 * 1000;

/** Educational narration — stable, clear, slightly slower. */
const VOICE_SETTINGS = {
  stability: 0.58,
  similarity_boost: 0.78,
  style: 0,
  use_speaker_boost: true,
  speed: 0.94,
};

async function requireTtsUser() {
  if (!isSupabaseConfigured()) {
    return { ok: false as const, error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }
  return { ok: true as const, user };
}

export async function GET() {
  const auth = await requireTtsUser();
  if (!auth.ok) return auth.error;
  return NextResponse.json({
    available: isElevenLabsConfigured(),
    voiceId: process.env.ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID,
    voiceName: DEFAULT_ELEVENLABS_VOICE_NAME,
    model: "eleven_multilingual_v2",
  });
}

export async function POST(req: Request) {
  try {
    const auth = await requireTtsUser();
    if (!auth.ok) return auth.error;

    const ipLimit = await consumeSharedRateLimit("tts-ip", clientIp(req), IP_LIMIT, WINDOW_MS);
    const blockedIp = rateLimitResponse(ipLimit);
    if (blockedIp) return blockedIp;
    const userLimit = await consumeSharedRateLimit("tts-user", auth.user.id, USER_LIMIT, WINDOW_MS);
    const blockedUser = rateLimitResponse(userLimit);
    if (blockedUser) return blockedUser;

    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    if (text.length > MAX_CHARS) {
      return NextResponse.json(
        { error: `Text exceeds the ${MAX_CHARS} character limit` },
        { status: 400 }
      );
    }

    const prepared = prepareTextForTts(text, true);
    const trimmed = prepared.trim();
    if (trimmed.length > MAX_CHARS) {
      return NextResponse.json(
        { error: `Text exceeds the ${MAX_CHARS} character limit` },
        { status: 400 }
      );
    }
    if (!trimmed) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;

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
