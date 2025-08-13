import { useGameStore } from '../store/useGameStore';
import { socket } from '../services/socket';
import PlayerList from '../components/PlayerList';

export default function Lobby() {
  const room = useGameStore(s => s.room);

  const startGame = () => {
    socket.emit('game:start', { code: room.code }, (res) => {
      if (!res?.ok) alert(res?.error || 'Cannot start');
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-10">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-indigo-600">Room: {room.code || '(loading...)'}</h2>
        <p>Status: <span className="font-semibold">{room.status}</span></p>
        <PlayerList />
        <p className="text-sm text-gray-500">Share this code with friends to join.</p>
        <button
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={startGame}
          disabled={room.status !== 'lobby'}
        >
          Start Game (Host)
        </button>
      </div>
    </div>
  );
}
