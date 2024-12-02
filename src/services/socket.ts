import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import toast from 'react-hot-toast';

const SOCKET_URL = 'https://bilgi.onrender.com';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  connect: () => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
      toast.success('Sunucuya bağlanıldı!');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      set({ isConnected: false });
      toast.error('Sunucu bağlantısı kurulamadı! Yeniden bağlanılıyor...');
      setTimeout(() => socket.connect(), 1000);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
      toast.error('Sunucu bağlantısı kesildi! Yeniden bağlanılıyor...');
      setTimeout(() => socket.connect(), 1000);
    });

    set({ socket });
  },
  disconnect: () => {
    set((state) => {
      state.socket?.disconnect();
      return { socket: null, isConnected: false };
    });
  },
}));