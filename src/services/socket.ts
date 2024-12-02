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
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
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