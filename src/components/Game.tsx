import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Timer } from 'lucide-react';

export const Game: React.FC = () => {
  const { room, player } = useGameStore();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (room?.gameState === 'countdown' && countdown === null) {
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
      return () => clearInterval(timer);
    }
  }, [room?.gameState]);

  if (!room || !player) return null;

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
      {countdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex items-center gap-4">
            <Timer className="w-8 h-8 text-blue-500" />
            <span className="text-4xl font-bold">{countdown}</span>
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
            <div className="font-semibold">{p.name}</div>
            <div className="text-2xl font-bold">{p.score} points</div>
          </div>
        ))}
      </div>

      {room.currentQuestion && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{room.currentQuestion.question}</h2>
          <div className="grid grid-cols-2 gap-4">
            {room.currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className="p-4 text-left rounded-lg border-2 hover:border-blue-500 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};