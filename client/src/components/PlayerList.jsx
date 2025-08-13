import { useGameStore } from '../store/useGameStore';

export default function PlayerList() {
  const players = useGameStore(s => s.room.players) || [];
  return (
    <div>
      <h4>Players</h4>
      <ul>{players.map((p, i) => <li key={i}>{p.name} — {p.score}</li>)}</ul>
    </div>
  );
}
