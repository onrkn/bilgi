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
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

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
      questions: getQuestions(),
      currentQuestionIndex: 0
    };
    
    rooms.set(roomCode, room);
    socket.join(roomCode);
    
    const systemMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `${playerName} odaya katıldı.`,
      timestamp: Date.now()
    };
    room.messages.push(systemMessage);
    
    socket.emit('roomCreated', room);
    console.log(`Room created: ${roomCode}`);
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('error', 'Oda bulunamadı.');
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', 'Oda dolu.');
      return;
    }

    socket.join(roomCode);
    room.players.push({
      id: socket.id,
      name: playerName,
      score: 0,
      isReady: false
    });

    const systemMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `${playerName} odaya katıldı.`,
      timestamp: Date.now()
    };
    room.messages.push(systemMessage);

    io.to(roomCode).emit('roomUpdated', room);
  });

  socket.on('playerReady', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = true;

    const systemMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `${player.name} hazır!`,
      timestamp: Date.now()
    };
    room.messages.push(systemMessage);

    const allPlayersReady = room.players.length === 2 && room.players.every(p => p.isReady);
    if (allPlayersReady) {
      room.gameState = 'countdown';
      io.to(roomId).emit('gameStartCountdown');
      
      setTimeout(() => {
        room.gameState = 'playing';
        room.currentQuestion = room.questions[room.currentQuestionIndex];
        io.to(roomId).emit('roomUpdated', room);
      }, 5000);
    }

    io.to(roomId).emit('roomUpdated', room);
  });

  socket.on('submitAnswer', ({ roomId, answerIndex }) => {
    const room = rooms.get(roomId);
    if (!room || !room.currentQuestion) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const isCorrect = answerIndex === room.currentQuestion.correctAnswer;
    if (isCorrect) {
      player.score += 10;
      
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `${player.name} doğru cevap verdi! +10 puan`,
        timestamp: Date.now()
      };
      room.messages.push(systemMessage);
    }

    if (player.score >= 100) {
      room.gameState = 'finished';
      const winMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `${player.name} oyunu kazandı!`,
        timestamp: Date.now()
      };
      room.messages.push(winMessage);
    } else {
      room.currentQuestionIndex++;
      if (room.currentQuestionIndex < room.questions.length) {
        room.currentQuestion = room.questions[room.currentQuestionIndex];
      }
    }

    io.to(roomId).emit('roomUpdated', room);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        const systemMessage = {
          id: Date.now().toString(),
          type: 'system',
          content: `${player.name} odadan ayrıldı.`,
          timestamp: Date.now()
        };
        room.messages.push(systemMessage);

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