import { useState, useEffect } from 'react';
import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import Game from './pages/Game.jsx';
import Results from './pages/Results.jsx';
import AddQuestion from './pages/AddQuestion.jsx'; // <-- import here
import { socket } from './services/socket.js';
import { useGameStore } from './store/useGameStore.js';

export default function App() {
  const [screen, setScreen] = useState('home');
  const setRoom = useGameStore(s => s.setRoom);
  const setQuestion = useGameStore(s => s.setQuestion);

  useEffect(() => {
    const onRoomState = (snap) => {
      setRoom(snap);
      setScreen(snap.status === 'playing' ? 'game' : snap.status === 'ended' ? 'results' : 'lobby');
    };
    const onQuestionNext = (payload) => {
      setQuestion(payload);
      setScreen('game');
    };
    const onGameOver = () => setScreen('results');

    socket.on('room:state', onRoomState);
    socket.on('question:next', onQuestionNext);
    socket.on('game:over', onGameOver);
    return () => {
      socket.off('room:state', onRoomState);
      socket.off('question:next', onQuestionNext);
      socket.off('game:over', onGameOver);
    };
  }, [setRoom, setQuestion]);

  // render logic
  if (screen === 'home') return <Home go={setScreen} />;
  if (screen === 'lobby') return <Lobby go={setScreen} />;
  if (screen === 'game') return <Game go={setScreen} />;
  if (screen === 'addQuestion') return <AddQuestion go={setScreen} />; // <-- add this
  return <Results go={setScreen} />;
}
