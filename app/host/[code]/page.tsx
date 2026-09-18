"use client";

import { useEffect, useState } from "react";
import { CLUES, PHASES } from "@/data/game";

export default function Host({ params }: { params: { code: string } }) {
  const c = params.code.toUpperCase();

  const [d, setD] = useState<any>(null);
  const [e, setE] = useState("");

  async function load() {
    try {
      const response = await fetch(
        `/api/rooms/${c}/state?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      const json = await response.json();

      console.log("HOST STATE:", json);

      if (!response.ok) {
        setE(json.error || "Ошибка");
        return;
      }

      setD(json);
      setE("");
    } catch (error) {
      console.error(error);
      setE("Ошибка соединения");
    }
  }

  useEffect(() => {
    load();

    const timer = setInterval(load, 1500);

    return () => clearInterval(timer);
  }, [c]);

  async function act(action: any) {
    const hostToken = localStorage.getItem("host:" + c);

    const response = await fetch(`/api/rooms/${c}/host`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...action,
        hostToken,
      }),
    });

    if (!response.ok) {
      const json = await response.json();
      setE(json.error || "Ошибка");
    }

    await load();
  }

  if (!d) {
    return (
      <main className="wrap">
        <p>{e || "Загрузка..."}</p>
      </main>
    );
  }

  const players = Array.isArray(d.players) ? d.players : [];
  const opened = new Set(d.state?.opened_clues || []);

  return (
    <main className="wrap">
      <small>ПАНЕЛЬ ВЕДУЩЕГО</small>

      <h1>{c}</h1>

      <section>
        <h2>
          Игроки {players.length}/3
        </h2>
 
        {players.length === 0 && (
          <p>Игроки пока не подключены.</p>
        )}

        {players.map((p: any) => (
          <div className="row" key={p.id}>
            ● {p.name} — {p.role}
          </div>
        ))}
      </section>

      <section>
        <h2>Фаза</h2>

        <div className="buttons">
          {PHASES.map((p) => (
            <button
              className={d.room.phase === p ? "active" : ""}
              key={p}
              onClick={() =>
                act({
                  action: "phase",
                  phase: p,
                })
              }
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Улики</h2>

        <div className="clues">
          {CLUES.map((x) => (
            <button
              className={
                opened.has(x[0])
                  ? "clue active"
                  : "clue"
              }
              key={x[0]}
              onClick={() =>
                act({
                  action: "toggleClue",
                  clueId: x[0],
                })
              }
            >
              {x[0]}. {x[1]} —{" "}
              {opened.has(x[0])
                ? "ОТКРЫТА"
                : "закрыта"}
            </button>
          ))}
        </div>
      </section>

      {e && <p className="msg">{e}</p>}
    </main>
  );
}
