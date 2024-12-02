import { create } from 'zustand';
import { GameState, Message, Player, Question } from '../types/game';

interface GameStore extends GameState {
  setRoomCode: (code: string) => void;
  setPlayers: (players: Player[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  addMessage: (message: Message) => void;
  setGameStatus: (status: GameState['gameStatus']) => void;
  setCountdown: (count: number) => void;
  setAnswers: (answers: Record<string, number>) => void;
  setServerStatus: (status: GameState['serverStatus']) => void;
  reset: () => void;
}

const initialState: GameState = {
  roomCode: '',
  players: [],
  currentQuestion: null,
  messages: [],
  gameStatus: 'waiting',
  countdown: 5,
  answers: {},
  serverStatus: 'disconnected',
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setRoomCode: (code) => set({ roomCode: code }),
  setPlayers: (players) => set({ players }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  setGameStatus: (status) => set({ gameStatus: status }),
  setCountdown: (count) => set({ countdown: count }),
  setAnswers: (answers) => set({ answers }),
  setServerStatus: (status) => set({ serverStatus: status }),
  reset: () => set(initialState),
}));