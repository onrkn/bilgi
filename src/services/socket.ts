import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

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
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      set({ isConnected: false });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
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