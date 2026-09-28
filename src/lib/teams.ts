export type Player = { id: string; name: string; positions: string[]; skill: number; speed: number; vision: number; passing: number };
export function balanceTeams(players: Player[]) {
  if (players.length < 2) throw new Error('Selecione pelo menos dois jogadores.');
  const score = (p: Player) => p.skill * 4 + p.speed * 2 + p.vision * 2 + p.passing * 2;
  const sorted = [...players].sort((a,b) => score(b)-score(a) || a.name.localeCompare(b.name));
  const teams: Player[][] = [[], []];
  for (const p of sorted) {
    const utility = (team: Player[]) => team.reduce((n,x) => n + score(x),0);
    const overlap = (team: Player[]) => team.filter(x => x.positions.some(pos => p.positions.includes(pos))).length;
    const target = [0,1].sort((a,b) => {
      const cost = (i:number) => teams[i].length * 100 + utility(teams[i]) + overlap(teams[i]) * 12;
      return cost(a)-cost(b);
    })[0];
    teams[target].push(p);
  }
  return teams;
}
