import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useGameStore } from '../store/gameStore';

export const useSocket = () => {
  const { setRoom } = useGameStore();

  useEffect(() => {
    const initSocket = async () => {
      await socketService.connect();
      
      socketService.onRoomUpdated((room) => {
        setRoom(room);
      });
    };

    initSocket();

    return () => {
      socketService.disconnect();
    };
  }, [setRoom]);

  return socketService;
};