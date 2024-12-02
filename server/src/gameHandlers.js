export function setupGameHandlers(io, roomManager) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('createRoom', (playerName, callback) => {
      const roomId = roomManager.createRoom();
      const player = { id: socket.id, name: playerName };
      const room = roomManager.joinRoom(roomId, player);
      
      socket.join(roomId);
      callback({ success: true, room });
    });

    socket.on('joinRoom', ({ roomId, playerName }, callback) => {
      const player = { id: socket.id, name: playerName };
      const room = roomManager.joinRoom(roomId, player);

      if (!room) {
        callback({ success: false, error: 'Oda bulunamadı veya dolu' });
        return;
      }

      socket.join(roomId);
      io.to(roomId).emit('roomUpdated', room);
      callback({ success: true, room });
    });

    socket.on('ready', ({ roomId, isReady }) => {
      const room = roomManager.updatePlayerReady(roomId, socket.id, isReady);
      if (!room) return;

      io.to(roomId).emit('roomUpdated', room);

      const allReady = room.players.length === 2 && 
                      room.players.every(p => p.isReady);

      if (allReady) {
        room.gameState = 'countdown';
        io.to(roomId).emit('roomUpdated', room);

        let count = 5;
        const countdownInterval = setInterval(() => {
          count--;
          room.countdown = count;
          io.to(roomId).emit('roomUpdated', room);

          if (count === 0) {
            clearInterval(countdownInterval);
            room.gameState = 'playing';
            roomManager.nextQuestion(roomId);
            io.to(roomId).emit('roomUpdated', room);
          }
        }, 1000);
      }
    });

    socket.on('submitAnswer', ({ roomId, answer }) => {
      const room = roomManager.submitAnswer(roomId, socket.id, answer);
      if (!room) return;

      io.to(roomId).emit('roomUpdated', room);

      const allAnswered = room.players.every(p => p.currentAnswer !== null);
      if (allAnswered) {
        const currentQuestion = room.questions[room.currentQuestionIndex];
        
        setTimeout(() => {
          if (room.currentQuestionIndex < room.questions.length - 1) {
            roomManager.nextQuestion(roomId);
            io.to(roomId).emit('roomUpdated', room);
          } else {
            room.gameState = 'finished';
            io.to(roomId).emit('roomUpdated', room);
          }
        }, 2000);
      }
    });

    socket.on('chatMessage', ({ roomId, message }) => {
      const room = roomManager.addMessage(roomId, {
        id: Date.now().toString(),
        text: message,
        sender: socket.id,
        type: 'chat',
        timestamp: Date.now()
      });
      if (room) {
        io.to(roomId).emit('roomUpdated', room);
      }
    });

    socket.on('playAgain', ({ roomId }) => {
      const room = roomManager.resetRoom(roomId);
      if (room) {
        io.to(roomId).emit('roomUpdated', room);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}