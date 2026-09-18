import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { CLUES, INTRO, REVEAL } from "@/data/game";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _: Request,
  { params }: { params: { code: string } }
) {
  const d = db();

  const { data: r, error: roomError } = await d
    .from("rooms")
    .select("id,code,host_name,phase")
    .eq("code", params.code.toUpperCase())
    .single();

  if (roomError || !r) {
    return NextResponse.json(
      { error: "Комната не найдена", details: roomError?.message },
      { status: 404 }
    );
  }

  const { data: ps, error: playersError } = await d
    .from("players")
    .select("id,name,role,connected")
    .eq("room_id", r.id);

  const { data: s } = await d
    .from("public_game_state")
    .select("opened_clues,updated_at")
    .eq("room_id", r.id)
    .single();

  const set = new Set(s?.opened_clues || []);

  return NextResponse.json({
    room: r,
    players: ps || [],
    playersError: playersError?.message || null,
    state: {
      opened_clues: [...(s?.opened_clues || [])],
      clues: CLUES
        .filter((x) => set.has(x[0]))
        .map((x) => ({
          id: x[0],
          title: x[1],
          text: x[2],
        })),
    },
    intro: INTRO,
    reveal: r.phase === "REVEAL" ? REVEAL : null,
  });
}
