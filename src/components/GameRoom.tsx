import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Copy } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';

export const GameRoom: React.FC = () => {
  const { roomCode, players, gameStatus, countdown } = useGameStore();

  const copyRoomCode = () => {
    toast.success('Room code copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Game Room</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Room Code:</span>
          <code className="bg-gray-100 px-3 py-1 rounded">{roomCode}</code>
          <CopyToClipboard text={roomCode} onCopy={copyRoomCode}>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Copy size={20} />
            </button>
          </CopyToClipboard>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-sm text-gray-600">Score: {player.score}</p>
              </div>
              {player.isReady && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  Ready
                </span>
              )}
            </div>
          ))}
        </div>

        {gameStatus === 'countdown' && (
          <div className="text-center text-2xl font-bold">
            Starting in {countdown}...
          </div>
        )}
      </div>
    </div>
  );
};