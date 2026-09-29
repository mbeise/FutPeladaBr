export type Wash = {player_id:string;round_no:number;washed_at:string};
export type WashPlayer = {id:string;active:boolean};

export function washingRound(players:WashPlayer[], washes:Wash[]) {
  const active = players.filter(p=>p.active);
  const last = Math.max(0,...washes.map(w=>w.round_no));
  const done = new Set(washes.filter(w=>w.round_no===last).map(w=>w.player_id));
  const complete = active.length>0 && active.every(p=>done.has(p.id));
  const round = complete ? last+1 : Math.max(1,last);
  const washed = new Set(washes.filter(w=>w.round_no===round && active.some(p=>p.id===w.player_id)).map(w=>w.player_id));
  return { round, washed, active, completedRounds:complete?last:Math.max(0,last-1) };
}
