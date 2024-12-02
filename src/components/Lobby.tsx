import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSocketStore } from '../services/socket';
import { Users, Plus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export const Lobby: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { setRoom, setPlayer } = useGameStore();
  const { socket, connect } = useSocketStore();

  useEffect(() => {
    if (!socket) {
      connect();
    }

    if (socket) {
      socket.on('roomCreated', (room) => {
        setRoom(room);
        setPlayer(room.players[0]);
        toast.success('Room created successfully!');
      });

      socket.on('roomUpdated', (room) => {
        setRoom(room);
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          setPlayer(player);
        }
      });

      socket.on('error', (message) => {
        toast.error(message);
      });

      return () => {
        socket.off('roomCreated');
        socket.off('roomUpdated');
        socket.off('error');
      };
    }
  }, [socket]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) return;
    
    socket.emit('joinRoom', { roomCode, playerName });
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) return;

    socket.emit('createRoom', { playerName });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <Users className="w-16 h-16 text-blue-500" />
        </div>

        <div className="space-y-6">
          {isCreating ? (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Room
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Join Room
              </button>
            </form>
          )}

          <div className="text-center">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              {isCreating ? "Join existing room" : "Create new room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};