import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateRoomCode, getQuestions } from './utils.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const rooms = new Map();

io.on('connection', (socket) => {
  socket.on('createRoom', ({ playerName }) => {
    const roomCode = generateRoomCode();
    const room = {
      id: roomCode,
      players: [{
        id: socket.id,
        name: playerName,
        score: 0,
        isReady: false
      }],
      gameState: 'waiting',
      messages: [],
      questions: getQuestions()
    };
    
    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit('roomCreated', room);
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
    io.to(roomCode).emit('roomUpdated', room);
  });

  socket.on('playerReady', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    if (room.players.length === 2 && room.players.every(p => p.isReady)) {
      room.gameState = 'countdown';
      io.to(roomCode).emit('gameStarting');
      
      setTimeout(() => {
        room.gameState = 'playing';
        room.currentQuestionIndex = 0;
        room.currentQuestion = room.questions[0];
        io.to(roomCode).emit('questionStart', room.currentQuestion);
      }, 5000);
    }

    io.to(roomCode).emit('roomUpdated', room);
  });

  socket.on('submitAnswer', ({ roomCode, answer }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const currentQuestion = room.questions[room.currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      player.score += 10;
    }

    io.to(roomCode).emit('answerSubmitted', {
      playerId: socket.id,
      isCorrect: answer === currentQuestion.correctAnswer
    });

    if (player.score >= 100) {
      room.gameState = 'finished';
      io.to(roomCode).emit('gameOver', { winner: player });
    } else if (room.currentQuestionIndex < room.questions.length - 1) {
      room.currentQuestionIndex++;
      room.currentQuestion = room.questions[room.currentQuestionIndex];
      io.to(roomCode).emit('questionStart', room.currentQuestion);
    }

    io.to(roomCode).emit('roomUpdated', room);
  });

  socket.on('chatMessage', ({ roomCode, message }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'chat',
      sender: player.name,
      content: message,
      timestamp: Date.now()
    };

    room.messages.push(newMessage);
    io.to(roomCode).emit('newMessage', newMessage);
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          rooms.delete(roomCode);
        } else {
          io.to(roomCode).emit('roomUpdated', room);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});