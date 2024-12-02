import { io, Socket } from 'socket.io-client';
import { Room } from '../types/game';

const SOCKET_URL = 'https://bilgi.onrender.com';

class SocketService {
  private socket: Socket;
  private static instance: SocketService;

  private constructor() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('connect_timeout', () => {
      console.error('Socket connection timeout');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) {
        resolve();
        return;
      }

      this.socket.connect();

      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  }

  public createRoom(playerName: string): Promise<{ success: boolean; room: Room }> {
    return new Promise((resolve, reject) => {
      if (!this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('createRoom', playerName, resolve);
    });
  }

  public joinRoom(roomId: string, playerName: string): Promise<{ success: boolean; room: Room; error?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('joinRoom', { roomId, playerName }, resolve);
    });
  }

  public onRoomUpdated(callback: (room: Room) => void): void {
    this.socket.on('roomUpdated', callback);
  }

  public setReady(roomId: string, isReady: boolean): void {
    if (this.socket.connected) {
      this.socket.emit('ready', { roomId, isReady });
    }
  }

  public submitAnswer(roomId: string, answer: string): void {
    if (this.socket.connected) {
      this.socket.emit('submitAnswer', { roomId, answer });
    }
  }

  public sendMessage(roomId: string, message: string): void {
    if (this.socket.connected) {
      this.socket.emit('chatMessage', { roomId, message });
    }
  }

  public playAgain(roomId: string): void {
    if (this.socket.connected) {
      this.socket.emit('playAgain', { roomId });
    }
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}

export const socketService = SocketService.getInstance();