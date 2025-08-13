import { useGameStore } from '../store/useGameStore';

export default function Results() {
  const room = useGameStore(s => s.room);

  const sorted = [...(room.players || [])].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-10 bg-gradient-to-b from-indigo-50 to-white space-y-8">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">🏆 Results</h1>

      {/* Winner Highlight */}
      {winner && (
        <div className="w-full max-w-md p-6 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">{winner.name}</h2>
          <p className="text-xl font-semibold text-yellow-700">{winner.score} points</p>
          <p className="text-sm text-yellow-600 mt-1">Winner 🏅</p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-3">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Leaderboard</h3>
        <ol className="space-y-2">
          {sorted.map((p, i) => (
            <li
              key={i}
              className={`flex justify-between items-center p-3 rounded-lg ${
                i === 0 ? 'bg-indigo-100 font-bold' : 'bg-gray-100'
              }`}
            >
              <span className="text-gray-800">{p.name}</span>
              <span className="text-gray-900 font-medium">{p.score}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Play Again Button */}
      <button
        onClick={() => window.location.reload()}
        className="mt-4 w-full max-w-md bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Play Again
      </button>
    </div>
  );
}
