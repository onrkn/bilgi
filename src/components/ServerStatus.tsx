import React from 'react';
import { useSocketStore } from '../services/socket';
import { Wifi, WifiOff } from 'lucide-react';

export const ServerStatus: React.FC = () => {
  const { isConnected } = useSocketStore();

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg">
      {isConnected ? (
        <>
          <Wifi className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-500">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-500">Disconnected</span>
        </>
      )}
    </div>
  );
};