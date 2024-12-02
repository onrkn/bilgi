export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  currentAnswer?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Room {
  id: string;
  players: Player[];
  currentQuestion?: Question;
  messages: Message[];
  gameState: 'waiting' | 'countdown' | 'playing' | 'finished';
  countdown: number;
}

export interface Message {
  id: string;
  text: string;
  type: 'chat' | 'system';
  sender?: string;
  timestamp: number;
}