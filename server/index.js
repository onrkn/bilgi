import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { questions } from './questions.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

const rooms = new Map();
const POINTS_PER_CORRECT_ANSWER = 10;
const WINNING_SCORE = 100;

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomQuestions(count = 20) {
  return [...questions].sort(() => Math.random() - 0.5).slice(0, count);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', (playerName) => {
    const roomCode = generateRoomCode();
    rooms.set(roomCode, {
      players: [{
        id: socket.id,
        name: playerName,
        score: 0,
        isReady: false
      }],
      questions: getRandomQuestions(),
      currentQuestionIndex: 0,
      answers: {},
      messages: []
    });

    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    io.to(roomCode).emit('gameState', rooms.get(roomCode));
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName,
      score: 0,
      isReady: false
    });

    socket.join(roomCode);
    io.to(roomCode).emit('gameState', room);
  });

  socket.on('playerReady', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    if (room.players.length === 2 && room.players.every(p => p.isReady)) {
      io.to(roomCode).emit('startCountdown');
      setTimeout(() => {
        io.to(roomCode).emit('gameStart', room.questions[0]);
      }, 5000);
    }

    io.to(roomCode).emit('gameState', room);
  });

  socket.on('submitAnswer', ({ roomCode, answer }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.answers[socket.id] = answer;
    io.to(roomCode).emit('playerAnswered', socket.id);

    if (Object.keys(room.answers).length === 2) {
      const currentQuestion = room.questions[room.currentQuestionIndex];
      
      // Calculate scores
      Object.entries(room.answers).forEach(([playerId, playerAnswer]) => {
        const player = room.players.find(p => p.id === playerId);
        if (player && playerAnswer === currentQuestion.correctAnswer) {
          player.score += POINTS_PER_CORRECT_ANSWER;
        }
      });

      // Check for winner
      const winner = room.players.find(p => p.score >= WINNING_SCORE);
      if (winner) {
        io.to(roomCode).emit('gameOver', winner);
      } else {
        room.currentQuestionIndex++;
        room.answers = {};
        
        if (room.currentQuestionIndex < room.questions.length) {
          io.to(roomCode).emit('nextQuestion', room.questions[room.currentQuestionIndex]);
        } else {
          const winner = room.players.reduce((a, b) => a.score > b.score ? a : b);
          io.to(roomCode).emit('gameOver', winner);
        }
      }

      io.to(roomCode).emit('gameState', room);
    }
  });

  socket.on('chatMessage', ({ roomCode, message }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const chatMessage = {
      id: Date.now().toString(),
      sender: player.name,
      text: message,
      type: 'user',
      timestamp: Date.now()
    };

    room.messages.push(chatMessage);
    io.to(roomCode).emit('newMessage', chatMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          rooms.delete(roomCode);
        } else {
          io.to(roomCode).emit('gameState', room);
          io.to(roomCode).emit('playerLeft');
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});