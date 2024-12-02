import { useEffect } from 'react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const {
    setRoomCode,
    setPlayers,
    setCurrentQuestion,
    addMessage,
    setGameStatus,
    setCountdown,
    setAnswers,
    setServerStatus,
    reset
  } = useGameStore();

  useEffect(() => {
    socket.on('connect', () => {
      setServerStatus('connected');
      toast.success('Connected to server');
    });

    socket.on('disconnect', () => {
      setServerStatus('disconnected');
      toast.error('Disconnected from server');
    });

    socket.on('roomCreated', (roomCode: string) => {
      setRoomCode(roomCode);
      toast.success('Room created successfully!');
    });

    socket.on('gameState', (state: any) => {
      setPlayers(state.players);
      if (state.currentQuestion) {
        setCurrentQuestion(state.currentQuestion);
      }
      if (state.answers) {
        setAnswers(state.answers);
      }
    });

    socket.on('startCountdown', () => {
      setGameStatus('countdown');
      let count = 5;
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
        }
      }, 1000);
    });

    socket.on('gameStart', (question: any) => {
      setGameStatus('playing');
      setCurrentQuestion(question);
    });

    socket.on('playerAnswered', (playerId: string) => {
      addMessage({
        id: Date.now().toString(),
        text: 'A player has submitted their answer',
        type: 'system',
        timestamp: Date.now()
      });
    });

    socket.on('nextQuestion', (question: any) => {
      setCurrentQuestion(question);
      setAnswers({});
    });

    socket.on('gameOver', (winner: any) => {
      setGameStatus('finished');
      addMessage({
        id: Date.now().toString(),
        text: `Game Over! ${winner.name} wins with ${winner.score} points!`,
        type: 'system',
        timestamp: Date.now()
      });
    });

    socket.on('error', (message: string) => {
      toast.error(message);
    });

    socket.on('playerLeft', () => {
      addMessage({
        id: Date.now().toString(),
        text: 'A player has left the game',
        type: 'system',
        timestamp: Date.now()
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomCreated');
      socket.off('gameState');
      socket.off('startCountdown');
      socket.off('gameStart');
      socket.off('playerAnswered');
      socket.off('nextQuestion');
      socket.off('gameOver');
      socket.off('error');
      socket.off('playerLeft');
    };
  }, []);

  return {
    createRoom: (playerName: string) => socket.emit('createRoom', playerName),
    joinRoom: (roomCode: string, playerName: string) => 
      socket.emit('joinRoom', { roomCode, playerName }),
    setReady: (roomCode: string) => socket.emit('playerReady', roomCode),
    submitAnswer: (roomCode: string, answer: number) => 
      socket.emit('submitAnswer', { roomCode, answer }),
    sendMessage: (roomCode: string, message: string) => 
      socket.emit('chatMessage', { roomCode, message })
  };
};