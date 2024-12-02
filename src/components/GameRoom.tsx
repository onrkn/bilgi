import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { Chat } from './Chat';
import { Timer, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

export const GameRoom: React.FC = () => {
  const { room, player } = useGameStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const socketService = useSocket();

  useEffect(() => {
    if (room?.gameState === 'playing') {
      setSelectedAnswer(null);
    }
  }, [room?.currentQuestionIndex]);

  if (!room || !player) return null;

  const handleReady = () => {
    socketService.setReady(room.id, !player.isReady);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    socketService.submitAnswer(room.id, answer);
  };

  const handlePlayAgain = () => {
    socketService.playAgain(room.id);
  };

  const currentQuestion = room.questions?.[room.currentQuestionIndex];
  const winner = room.gameState === 'finished' 
    ? room.players.reduce((prev, current) => 
        prev.score > current.score ? prev : current
      )
    : null;

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Oda: {room.id}</h2>
              {room.gameState === 'countdown' && (
                <div className="flex items-center gap-2">
                  <Timer className="animate-pulse" />
                  <span className="text-xl">{room.countdown}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-600">Puan: {p.score}</p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      p.isReady ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
              ))}
            </div>

            {room.gameState === 'waiting' && (
              <button
                onClick={handleReady}
                className={clsx(
                  'w-full p-4 rounded-lg text-white',
                  player.isReady ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                )}
              >
                {player.isReady ? 'Hazır Değil' : 'Hazır'}
              </button>
            )}

            {currentQuestion && room.gameState === 'playing' && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl mb-4">{currentQuestion.text}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={clsx(
                        'p-4 rounded-lg shadow transition',
                        selectedAnswer === option
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-blue-50',
                        selectedAnswer && 'cursor-not-allowed'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {room.gameState === 'finished' && winner && (
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {winner.id === player.id ? 'Tebrikler! Kazandın!' : `${winner.name} kazandı!`}
                </h2>
                <p className="text-gray-600 mb-6">Final Skoru: {winner.score}</p>
                <button
                  onClick={handlePlayAgain}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  Tekrar Oyna
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <Chat />
        </div>
      </div>
    </div>
  );
};