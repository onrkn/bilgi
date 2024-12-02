import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSocketStore } from '../services/socket';
import { Timer, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Game: React.FC = () => {
  const { room, player } = useGameStore();
  const { socket } = useSocketStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleGameStart = () => {
      toast.success('Oyun başlıyor!');
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleRoomUpdated = (updatedRoom: any) => {
      if (updatedRoom.gameState === 'countdown' && room?.gameState !== 'countdown') {
        handleGameStart();
      }
      setSelectedAnswer(null);
    };

    socket.on('gameStartCountdown', handleGameStart);
    socket.on('roomUpdated', handleRoomUpdated);

    return () => {
      socket.off('gameStartCountdown', handleGameStart);
      socket.off('roomUpdated', handleRoomUpdated);
    };
  }, [socket, room?.gameState]);

  const handleReady = () => {
    if (!socket || !room) return;
    socket.emit('playerReady', { roomId: room.id });
    toast.success('Hazır olduğunuzu bildirdiniz!');
  };

  const handleAnswer = (answerIndex: number) => {
    if (!socket || !room || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    socket.emit('submitAnswer', { roomId: room.id, answerIndex });
  };

  if (!room || !player) return null;

  const currentPlayer = room.players.find(p => p.id === player.id);
  const otherPlayer = room.players.find(p => p.id !== player.id);
  const isPlayerReady = currentPlayer?.isReady;
  const isOtherPlayerReady = otherPlayer?.isReady;

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
      {countdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex items-center gap-4">
            <Timer className="w-8 h-8 text-blue-500" />
            <span className="text-4xl font-bold">Oyun {countdown} saniye içinde başlıyor!</span>
          </div>
        </div>
      )}

      <div className="flex justify-between mb-8">
        {room.players.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-lg ${
              p.id === player.id ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <div className="font-semibold flex items-center gap-2">
              {p.name}
              {p.isReady && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="text-2xl font-bold">{p.score} puan</div>
          </div>
        ))}
      </div>

      {room.gameState === 'waiting' && (
        <div className="text-center space-y-4">
          <div className="text-gray-600">
            {room.players.length < 2 ? (
              'Diğer oyuncunun katılması bekleniyor...'
            ) : !isPlayerReady ? (
              'Hazır olduğunuzda butona tıklayın'
            ) : !isOtherPlayerReady ? (
              'Diğer oyuncunun hazır olması bekleniyor...'
            ) : (
              'Oyun başlıyor!'
            )}
          </div>
          <button
            onClick={handleReady}
            disabled={isPlayerReady || room.players.length < 2}
            className={`px-6 py-3 rounded-lg ${
              isPlayerReady
                ? 'bg-green-500 text-white cursor-not-allowed'
                : room.players.length < 2
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            {isPlayerReady ? 'Hazır!' : 'Hazır mısın?'}
          </button>
        </div>
      )}

      {room.currentQuestion && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{room.currentQuestion.question}</h2>
          <div className="grid grid-cols-2 gap-4">
            {room.currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 text-left rounded-lg border-2 transition-colors ${
                  selectedAnswer === index
                    ? 'bg-blue-100 border-blue-500'
                    : selectedAnswer !== null
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-blue-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {room.gameState === 'finished' && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            {currentPlayer.score >= 100 ? 'Tebrikler, kazandınız!' : 'Maalesef kaybettiniz!'}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Yeni Oyun
          </button>
        </div>
      )}
    </div>
  );
};