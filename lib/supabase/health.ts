import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type SupabaseHealth = {
  configured: boolean;
  reachable: boolean;
  tables: {
    profiles: boolean;
    quiz_centre_progress: boolean;
    course_progress: boolean;
  };
  rpc: {
    record_quiz_centre_attempt: boolean;
    record_course_lesson: boolean;
  };
  error?: string;
};

function tableMissing(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache")
  );
}

/** Probe Supabase project + schema from the server (no user session required). */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const empty: SupabaseHealth = {
    configured: false,
    reachable: false,
    tables: {
      profiles: false,
      quiz_centre_progress: false,
      course_progress: false,
    },
    rpc: {
      record_quiz_centre_attempt: false,
      record_course_lesson: false,
    },
  };

  if (!isSupabaseConfigured()) return empty;

  try {
    const supabase = await createClient();

    const [profiles, quiz, course] = await Promise.all([
      supabase.from("profiles").select("id").limit(1),
      supabase.from("quiz_centre_progress").select("quiz_id").limit(1),
      supabase.from("course_progress").select("course_id").limit(1),
    ]);

    const tables = {
      profiles: !tableMissing(profiles.error),
      quiz_centre_progress: !tableMissing(quiz.error),
      course_progress: !tableMissing(course.error),
    };

    // RPCs exist if the call fails with "Not authenticated", not "function not found"
    const [quizRpc, courseRpc] = await Promise.all([
      supabase.rpc("record_quiz_centre_attempt", {
        p_quiz_id: 0,
        p_score: 0,
        p_total: 0,
        p_xp: 0,
      }),
      supabase.rpc("record_course_lesson", {
        p_course_id: 0,
        p_lesson_id: "__probe__",
        p_xp: 0,
      }),
    ]);

    const rpcMissing = (error: { message?: string } | null) => {
      const msg = (error?.message ?? "").toLowerCase();
      return msg.includes("function") && msg.includes("does not exist");
    };

    const rpc = {
      record_quiz_centre_attempt:
        !rpcMissing(quizRpc.error) ||
        (quizRpc.error?.message ?? "").includes("Not authenticated"),
      record_course_lesson:
        !rpcMissing(courseRpc.error) ||
        (courseRpc.error?.message ?? "").includes("Not authenticated"),
    };

    const allTables = Object.values(tables).every(Boolean);
    const allRpc = Object.values(rpc).every(Boolean);

    return {
      configured: true,
      reachable: allTables && allRpc,
      tables,
      rpc,
      error:
        allTables && allRpc
          ? undefined
          : "Some tables or functions are missing. Run supabase/schema.sql in the SQL Editor.",
    };
  } catch (e) {
    return {
      ...empty,
      configured: true,
      error: e instanceof Error ? e.message : "Could not reach Supabase",
    };
  }
}
