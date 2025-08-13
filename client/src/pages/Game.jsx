import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { socket } from '../services/socket';
import QuestionCard from '../components/QuestionCard';

export default function Game() {
  const room = useGameStore(s => s.room);
  const q = useGameStore(s => s.question);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  const msLeft = useMemo(() => Math.max(0, (q?.endsAt || now) - now), [q, now]);
  const secondsLeft = Math.ceil(msLeft / 1000);

  const submit = (choice) => {
    socket.emit('answer:submit', { code: room.code, choice }, (res) => { });
  };

  if (!q) return <div className="text-center mt-20">Waiting for next question…</div>;

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-10 space-y-6">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Q{(q.index ?? 0) + 1}</h3>
          <span className="font-semibold text-red-500">⏱ {secondsLeft}s</span>
        </div>
        <QuestionCard text={q.question.text} options={q.question.options} onChoose={submit} disabled={secondsLeft === 0} />
      </div>
      <div className="w-full max-w-lg bg-white p-4 rounded-lg shadow-md">
        <h4 className="font-semibold mb-2">Scores</h4>
        <ul className="space-y-1">
          {room.players.map((p, i) => (
            <li key={i} className="flex justify-between border-b py-1">
              <span>{p.name}</span>
              <span className="font-medium text-indigo-600">{p.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
