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
      const room = roomManager.getRoom(roomId);
      if (!room) {
        callback({ success: false, error: 'Oda bulunamadı' });
        return;
      }

      if (room.players.length >= 2) {
        callback({ success: false, error: 'Oda dolu' });
        return;
      }

      const player = { id: socket.id, name: playerName };
      const updatedRoom = roomManager.joinRoom(roomId, player);

      socket.join(roomId);
      io.to(roomId).emit('roomUpdated', updatedRoom);
      callback({ success: true, room: updatedRoom });

      // Sistem mesajı ekle
      roomManager.addMessage(roomId, {
        id: Date.now().toString(),
        text: `${playerName} odaya katıldı`,
        type: 'system',
        timestamp: Date.now()
      });
      io.to(roomId).emit('roomUpdated', updatedRoom);
    });

    socket.on('ready', ({ roomId, isReady }) => {
      const room = roomManager.updatePlayerReady(roomId, socket.id, isReady);
      if (!room) return;

      // Sistem mesajı ekle
      const player = room.players.find(p => p.id === socket.id);
      roomManager.addMessage(roomId, {
        id: Date.now().toString(),
        text: `${player?.name} ${isReady ? 'hazır' : 'hazır değil'}`,
        type: 'system',
        timestamp: Date.now()
      });

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

      const player = room.players.find(p => p.id === socket.id);
      roomManager.addMessage(roomId, {
        id: Date.now().toString(),
        text: `${player?.name} cevabını verdi`,
        type: 'system',
        timestamp: Date.now()
      });

      io.to(roomId).emit('roomUpdated', room);

      const allAnswered = room.players.every(p => p.currentAnswer !== null);
      if (allAnswered) {
        const currentQuestion = room.questions[room.currentQuestionIndex];
        
        // Doğru cevabı ve puanları bildir
        roomManager.addMessage(roomId, {
          id: Date.now().toString(),
          text: `Doğru cevap: ${currentQuestion.correctAnswer}`,
          type: 'system',
          timestamp: Date.now()
        });

        setTimeout(() => {
          if (room.currentQuestionIndex < room.questions.length - 1) {
            roomManager.nextQuestion(roomId);
            io.to(roomId).emit('roomUpdated', room);
          } else {
            room.gameState = 'finished';
            const winner = room.players.reduce((prev, current) => 
              prev.score > current.score ? prev : current
            );
            roomManager.addMessage(roomId, {
              id: Date.now().toString(),
              text: `Oyun bitti! Kazanan: ${winner.name} (${winner.score} puan)`,
              type: 'system',
              timestamp: Date.now()
            });
            io.to(roomId).emit('roomUpdated', room);
          }
        }, 2000);
      }
    });

    socket.on('chatMessage', ({ roomId, message }) => {
      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      const updatedRoom = roomManager.addMessage(roomId, {
        id: Date.now().toString(),
        text: message,
        sender: player.name,
        type: 'chat',
        timestamp: Date.now()
      });

      if (updatedRoom) {
        io.to(roomId).emit('roomUpdated', updatedRoom);
      }
    });

    socket.on('playAgain', ({ roomId }) => {
      const room = roomManager.resetRoom(roomId);
      if (room) {
        roomManager.addMessage(roomId, {
          id: Date.now().toString(),
          text: 'Yeni oyun başlıyor!',
          type: 'system',
          timestamp: Date.now()
        });
        io.to(roomId).emit('roomUpdated', room);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // TODO: Odadan çıkış işlemleri eklenebilir
    });
  });
}