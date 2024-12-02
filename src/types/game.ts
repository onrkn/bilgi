export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}

export interface Room {
  id: string;
  players: Player[];
  currentQuestion?: Question;
  gameState: 'waiting' | 'countdown' | 'playing' | 'finished';
  messages: Message[];
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Message {
  id: string;
  type: 'chat' | 'system';
  sender?: string;
  content: string;
  timestamp: number;
}