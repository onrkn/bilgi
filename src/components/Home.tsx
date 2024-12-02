import React, { useState } from 'react';
import { Users, Plus, LogIn } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';

export const Home: React.FC = () => {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const socketService = useSocket();
  const { setRoom, setPlayer } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'create') {
        const result = await socketService.createRoom(name);
        if (result.success) {
          setRoom(result.room);
          setPlayer(result.room.players[0]);
        }
      } else {
        const result = await socketService.joinRoom(roomId, name);
        if (result.success) {
          setRoom(result.room);
          const player = result.room.players.find(p => p.name === name);
          if (player) setPlayer(player);
        } else {
          setError(result.error || 'Odaya katılırken bir hata oluştu');
        }
      }
    } catch (err) {
      setError('Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Quiz Battle</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {!mode ? (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              <Plus size={20} />
              Oda Oluştur
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
              disabled={isLoading}
            >
              <LogIn size={20} />
              Odaya Katıl
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İsminiz
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            
            {mode === 'join' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oda Kodu
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Users size={20} />
                  {mode === 'create' ? 'Oda Oluştur' : 'Odaya Katıl'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setError('');
              }}
              className="w-full text-gray-600 p-4 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              disabled={isLoading}
            >
              Geri
            </button>
          </form>
        )}
      </div>
    </div>
  );
};