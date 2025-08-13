import { create } from 'zustand';

export const useGameStore = create((set) => ({
  me: { name: '' },
  room: { code: '', status: 'lobby', players: [], currentIndex: -1, endsAt: null },
  question: null,
  setMe: (me) => set({ me }),
  setRoom: (room) => set({ room }),
  setQuestion: (question) => set({ question })
}));
