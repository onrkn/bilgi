import { create } from 'zustand';
import { Room, Player, Message } from '../types/game';

interface GameState {
  room: Room | null;
  player: Player | null;
  setRoom: (room: Room) => void;
  setPlayer: (player: Player) => void;
  addMessage: (message: Message) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  room: null,
  player: null,
  setRoom: (room) => set({ room }),
  setPlayer: (player) => set({ player }),
  addMessage: (message) => set((state) => ({
    room: state.room ? {
      ...state.room,
      messages: [...state.room.messages, message]
    } : null
  })),
  resetGame: () => set({ room: null, player: null })
}));