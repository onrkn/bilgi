import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Wifi, WifiOff } from 'lucide-react';

export const ServerStatus: React.FC = () => {
  const serverStatus = useGameStore((state) => state.serverStatus);

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-full flex items-center gap-2 ${
        serverStatus === 'connected'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {serverStatus === 'connected' ? (
        <>
          <Wifi size={20} /> Connected
        </>
      ) : (
        <>
          <WifiOff size={20} /> Disconnected
        </>
      )}
    </div>
  );
};