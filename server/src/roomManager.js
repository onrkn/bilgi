import { nanoid } from 'nanoid';
import { questions } from './questions.js';

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom() {
    const roomId = nanoid(6);
    this.rooms.set(roomId, {
      id: roomId,
      players: [],
      messages: [],
      gameState: 'waiting',
      countdown: 5,
      currentQuestionIndex: -1,
      questions: this.getRandomQuestions()
    });
    return roomId;
  }

  getRandomQuestions() {
    return [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
  }

  joinRoom(roomId, player) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length >= 2) return null;

    room.players.push({
      ...player,
      score: 0,
      isReady: false,
      currentAnswer: null
    });

    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  updatePlayerReady(roomId, playerId, isReady) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = isReady;
    }

    return room;
  }

  addMessage(roomId, message) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.messages.push(message);
    return room;
  }

  submitAnswer(roomId, playerId, answer) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    player.currentAnswer = answer;
    const currentQuestion = room.questions[room.currentQuestionIndex];
    
    if (answer === currentQuestion.correctAnswer) {
      player.score += 10;
    }

    return room;
  }

  nextQuestion(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.currentQuestionIndex++;
    room.players.forEach(player => {
      player.currentAnswer = null;
    });

    return room;
  }

  resetRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.currentQuestionIndex = -1;
    room.gameState = 'waiting';
    room.countdown = 5;
    room.questions = this.getRandomQuestions();
    room.players.forEach(player => {
      player.score = 0;
      player.isReady = false;
      player.currentAnswer = null;
    });

    return room;
  }
}