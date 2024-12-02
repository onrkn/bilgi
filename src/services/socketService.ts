import { io, Socket } from 'socket.io-client';
import { Room } from '../types/game';

const SOCKET_URL = 'https://bilgi.onrender.com';

class SocketService {
  private socket: Socket;
  private static instance: SocketService;

  private constructor() {
    this.socket = io(SOCKET_URL);
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): Promise<void> {
    return new Promise((resolve) => {
      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });
    });
  }

  public createRoom(playerName: string): Promise<{ success: boolean; room: Room }> {
    return new Promise((resolve) => {
      this.socket.emit('createRoom', playerName, resolve);
    });
  }

  public joinRoom(roomId: string, playerName: string): Promise<{ success: boolean; room: Room; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit('joinRoom', { roomId, playerName }, resolve);
    });
  }

  public onRoomUpdated(callback: (room: Room) => void): void {
    this.socket.on('roomUpdated', callback);
  }

  public setReady(roomId: string, isReady: boolean): void {
    this.socket.emit('ready', { roomId, isReady });
  }

  public submitAnswer(roomId: string, answer: string): void {
    this.socket.emit('submitAnswer', { roomId, answer });
  }

  public sendMessage(roomId: string, message: string): void {
    this.socket.emit('chatMessage', { roomId, message });
  }

  public playAgain(roomId: string): void {
    this.socket.emit('playAgain', { roomId });
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}

export const socketService = SocketService.getInstance();