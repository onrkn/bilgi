import { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { useGameStore } from '../store/gameStore';

export const useSocket = () => {
  const { setRoom } = useGameStore();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      if (isConnecting) return;
      setIsConnecting(true);

      try {
        await socketService.connect();
        
        socketService.onRoomUpdated((room) => {
          setRoom(room);
        });
      } catch (error) {
        console.error('Failed to connect to socket:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    initSocket();

    return () => {
      socketService.disconnect();
    };
  }, [setRoom, isConnecting]);

  return socketService;
};