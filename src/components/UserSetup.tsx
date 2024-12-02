import React, { useState } from 'react';
import { Users, UserPlus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

export const UserSetup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const { createRoom, joinRoom } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (mode === 'join' && !roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    if (mode === 'create') {
      createRoom(username);
    } else {
      joinRoom(roomCode, username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Users size={48} className="text-blue-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">
          Multiplayer Quiz Game
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2
              ${mode === 'create' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700'}`}
          >
            <UserPlus size={20} />
            Create Room
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2
              ${mode === 'join' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700'}`}
          >
            <LogIn size={20} />
            Join Room
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
              maxLength={20}
            />
          </div>

          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter room code"
                maxLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
};