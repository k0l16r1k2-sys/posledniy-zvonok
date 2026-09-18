"use client";import{useEffect,useState}from"react";import{CLUES,PHASES}from"@/data/game";
export default function Host({params}:{params:{code:string}}){const c=params.code.toUpperCase(),[d,setD]=useState<any>(),[e,setE]=useState("");async function load() {
  try {
    const x = await fetch(
      "/api/rooms/" + c + "/state?t=" + Date.now(),
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    const j = await x.json();

    console.log("STATE:", j);

    if (x.ok) {
      setD(j);
      setE("");
    } else {
      setE(j.error || "Ошибка загрузки");
    }
  } catch (err) {
    console.error(err);
    setE("Не удалось получить состояние комнаты");
  }
}
useEffect(()=>{load();const t=setInterval(load,1500);return()=>clearInterval(t)},[]);async function act(a:any){const t=localStorage.getItem("host:"+c);const x=await fetch("/api/rooms/"+c+"/host",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...a,hostToken:t})});if(!x.ok){const j=await x.json();setE(j.error)}load()}if(!d)return <main className="wrap"><p>{e||"Загрузка..."}</p></main>;const opened=new Set(d.state.opened_clues);return <main className="wrap"><small>ПАНЕЛЬ ВЕДУЩЕГО</small><h1>{c}</h1><section><h2>Игроки {d.players.length}/3</h2>{d.players.map((p:any)=><div className="row" key={p.id}>● {p.name} — {p.role}</div>)}</section><section><h2>Фаза</h2><div className="buttons">{PHASES.map(p=><button className={d.room.phase===p?"active":""} key={p} onClick={()=>act({action:"phase",phase:p})}>{p}</button>)}</div></section><section><h2>Улики</h2><div className="clues">{CLUES.map(x=><button className={opened.has(x[0])?"clue active":"clue"} key={x[0]} onClick={()=>act({action:"toggleClue",clueId:x[0]})}>{x[0]}. {x[1]} — {opened.has(x[0])?"ОТКРЫТА":"закрыта"}</button>)}</div></section>{e&&<p className="msg">{e}</p>}</main>}
