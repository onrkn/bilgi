export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}

export interface Message {
  id: string;
  text: string;
  type: 'system' | 'user';
  sender?: string;
  timestamp: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  currentQuestion: Question | null;
  messages: Message[];
  gameStatus: 'waiting' | 'countdown' | 'playing' | 'finished';
  countdown: number;
  answers: Record<string, number>;
  serverStatus: 'connected' | 'disconnected';
}