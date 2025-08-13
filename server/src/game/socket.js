import { customAlphabet } from 'nanoid';
import Question from '../models/Question.js';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

const rooms = new Map();
// room structure:
// {
//   code, hostSocketId,
//   players: Map(socketId -> { name, score, answered }),
//   status: 'lobby'|'playing'|'ended',
//   questions: [Question],
//   currentIndex: -1,
//   currentEndsAt: null,
//   timers: { round, intermission }
// }

function snapshot(room) {
  return {
    code: room.code,
    status: room.status,
    players: Array.from(room.players.values()).map(p => ({ name: p.name, score: p.score })),
    currentIndex: room.currentIndex,
    endsAt: room.currentEndsAt,
  };
}

export function initGameSocket(io) {
  io.on('connection', (socket) => {
    // utils
    const findRoomBySocket = () => {
      for (const [code, room] of rooms) if (room.players.has(socket.id)) return { code, room };
      return null;
    };
    const broadcastState = (code) => {
      const room = rooms.get(code); if (!room) return;
      io.to(code).emit('room:state', snapshot(room));
    };

    // create room (host)
    socket.on('room:create', async ({ name }, ack) => {
      try {
        const code = nanoid();
        const questions = await Question.find({}).limit(50); // includes seeded + user-added

        if (questions.length === 0) return ack?.({ ok: false, error: 'No questions in DB (run npm run seed)' });

        const room = {
          code,
          hostSocketId: socket.id,
          players: new Map(),
          status: 'lobby',
          questions,
          currentIndex: -1,
          currentEndsAt: null,
          timers: { round: null, intermission: null },
        };
        room.players.set(socket.id, { name: (name||'Host').trim(), score: 0, answered: false });
        rooms.set(code, room);
        socket.join(code);
        ack?.({ ok: true, code });
        broadcastState(code);
      } catch (e) {
        ack?.({ ok: false, error: e.message });
      }
    });

    // join room (player)
    socket.on('room:join', ({ name, code }, ack) => {
      code = (code||'').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) return ack?.({ ok: false, error: 'Room not found' });
      if (room.status !== 'lobby') return ack?.({ ok: false, error: 'Game already started' });

      room.players.set(socket.id, { name: (name||'Player').trim(), score: 0, answered: false });
      socket.join(code);
      ack?.({ ok: true });
      broadcastState(code);
    });

    // start game (host only)
    socket.on('game:start', ({ code }, ack) => {
      const room = rooms.get(code);
      if (!room) return ack?.({ ok: false, error: 'Room not found' });
      if (room.hostSocketId !== socket.id) return ack?.({ ok: false, error: 'Only host can start' });
      if (!room.questions?.length) return ack?.({ ok: false, error: 'No questions' });

      room.status = 'playing';
      runNextQuestion(io, room);
      broadcastState(code);
      ack?.({ ok: true });
    });

    // answer submit
    socket.on('answer:submit', ({ code, choice }, ack) => {
      const room = rooms.get(code);
      if (!room || room.status !== 'playing') return ack?.({ ok: false, error: 'Not playing' });

      const player = room.players.get(socket.id);
      if (!player) return ack?.({ ok: false, error: 'Not in room' });
      if (player.answered) return ack?.({ ok: false, error: 'Already answered' });

      const q = room.questions[room.currentIndex];
      const correct = q.correctIndex === choice;
      if (correct) player.score += 100;
      player.answered = true;

      ack?.({ ok: true, correct });

      // if all answered, end early
      const allAnswered = Array.from(room.players.values()).every(p => p.answered);
      if (allAnswered) {
        clearTimeout(room.timers.round);
        intermission(io, room);
      } else {
        broadcastState(code);
      }
    });

    socket.on('disconnect', () => {
      const hit = findRoomBySocket();
      if (!hit) return;
      const { code, room } = hit;

      room.players.delete(socket.id);

      if (socket.id === room.hostSocketId) {
        io.to(code).emit('game:over', { reason: 'Host left' });
        clearTimers(room);
        rooms.delete(code);
        return;
      }

      if (room.players.size === 0) {
        clearTimers(room);
        rooms.delete(code);
        return;
      }

      broadcastState(code);
    });
  });
}

function clearTimers(room) {
  if (room.timers.round) clearTimeout(room.timers.round);
  if (room.timers.intermission) clearTimeout(room.timers.intermission);
  room.timers.round = null;
  room.timers.intermission = null;
}

function runNextQuestion(io, room) {
  room.currentIndex += 1;
  if (room.currentIndex >= room.questions.length) {
    room.status = 'ended';
    io.to(room.code).emit('game:over');
    return;
  }

  for (const p of room.players.values()) p.answered = false;

  const q = room.questions[room.currentIndex];
  const DURATION = 15_000; // 15s
  room.currentEndsAt = Date.now() + DURATION;

  io.to(room.code).emit('question:next', {
    index: room.currentIndex,
    question: { text: q.text, options: q.options },
    endsAt: room.currentEndsAt,
  });
  io.to(room.code).emit('room:state', snapshot(room));

  room.timers.round = setTimeout(() => intermission(io, room), DURATION);
}

function intermission(io, room) {
  const GAP = 3000; // 3s
  io.to(room.code).emit('room:state', snapshot(room));
  room.timers.intermission = setTimeout(() => runNextQuestion(io, room), GAP);
}
