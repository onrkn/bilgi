import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD 
  ? 'https://bilgi.onrender.com'
  : 'http://localhost:3000';

export const socket = io(SOCKET_URL);