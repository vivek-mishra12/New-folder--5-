import { useState } from 'react';
import { socket } from '../services/socket';
import { useGameStore } from '../store/useGameStore';

export default function Home({ go }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const setMe = useGameStore(s => s.setMe);
  const setRoom = useGameStore(s => s.setRoom);

  function connectIfNeeded() {
    if (!socket.connected) socket.connect();
  }

  const createRoom = () => {
    connectIfNeeded();
    setMe({ name });
    socket.emit('room:create', { name }, (res) => {
      if (res?.ok) {
        setRoom({ code: res.code, status: 'lobby', players: [], currentIndex: -1 });
        go('lobby');
      } else {
        alert(res?.error || 'Failed');
      }
    });
  };

  const joinRoom = () => {
    connectIfNeeded();
    setMe({ name });
    socket.emit('room:join', { name, code: code.trim().toUpperCase() }, (res) => {
      if (res?.ok) go('lobby');
      else alert(res?.error || 'Join failed');
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold mb-8 text-indigo-600">Multiplayer Quiz</h1>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md space-y-4">
        <input
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          onClick={createRoom}
        >
          Create Room
        </button>
        <hr className="my-2" />
        <input
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter Room Code"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          onClick={joinRoom}
        >
          Join Room
        </button>

        <button
  className="mt-4 text-indigo-600 underline"
  onClick={() => go('addQuestion')}
>
  Add Your Own Question
       </button>
      </div>
    </div>
  );
}
