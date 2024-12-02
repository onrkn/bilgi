import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSocketStore } from '../services/socket';
import { Users, Plus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export const Lobby: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setRoom, setPlayer } = useGameStore();
  const { socket, connect, isConnected } = useSocketStore();

  useEffect(() => {
    if (!socket) {
      connect();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (room: any) => {
      setIsLoading(false);
      setRoom(room);
      setPlayer(room.players[0]);
      toast.success('Oda başarıyla oluşturuldu!');
    };

    const handleRoomUpdated = (room: any) => {
      setIsLoading(false);
      setRoom(room);
      const player = room.players.find((p: any) => p.id === socket.id);
      if (player) {
        setPlayer(player);
        toast.success('Odaya başarıyla katıldınız!');
      }
    };

    const handleError = (message: string) => {
      setIsLoading(false);
      toast.error(message);
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('roomUpdated', handleRoomUpdated);
    socket.on('error', handleError);

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('roomUpdated', handleRoomUpdated);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) {
      toast.error('Sunucu bağlantısı kurulamadı. Lütfen tekrar deneyin.');
      return;
    }

    if (!isConnected) {
      toast.error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      return;
    }

    if (!roomCode.trim() || !playerName.trim()) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), playerName });
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) {
      toast.error('Sunucu bağlantısı kurulamadı. Lütfen tekrar deneyin.');
      return;
    }

    if (!isConnected) {
      toast.error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      return;
    }

    if (!playerName.trim()) {
      toast.error('Lütfen isminizi girin.');
      return;
    }

    setIsLoading(true);
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
                  İsminiz
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !isConnected}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${
                  isLoading || !isConnected
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-lg transition-colors`}
              >
                <Plus className="w-5 h-5" />
                {isLoading ? 'Oda Oluşturuluyor...' : 'Oda Oluştur'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  İsminiz
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Oda Kodu
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                  maxLength={6}
                  placeholder="Örn: ABC123"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !isConnected}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${
                  isLoading || !isConnected
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-lg transition-colors`}
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? 'Odaya Katılınıyor...' : 'Odaya Katıl'}
              </button>
            </form>
          )}

          <div className="text-center">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="text-blue-500 hover:text-blue-600 transition-colors"
              disabled={isLoading}
            >
              {isCreating ? "Mevcut odaya katıl" : "Yeni oda oluştur"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};