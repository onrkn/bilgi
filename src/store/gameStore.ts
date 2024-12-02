import { create } from 'zustand';
import { Room, Player, Message } from '../types/game';

interface GameState {
  room: Room | null;
  player: Player | null;
  setRoom: (room: Room) => void;
  setPlayer: (player: Player) => void;
  addMessage: (message: Message) => void;
  updateGameState: (state: Room['gameState']) => void;
  updateCountdown: (count: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  room: null,
  player: null,
  setRoom: (room) => set({ room }),
  setPlayer: (player) => set({ player }),
  addMessage: (message) =>
    set((state) => ({
      room: state.room
        ? { ...state.room, messages: [...state.room.messages, message] }
        : null,
    })),
  updateGameState: (gameState) =>
    set((state) => ({
      room: state.room ? { ...state.room, gameState } : null,
    })),
  updateCountdown: (countdown) =>
    set((state) => ({
      room: state.room ? { ...state.room, countdown } : null,
    })),
  reset: () => set({ room: null, player: null }),
}));