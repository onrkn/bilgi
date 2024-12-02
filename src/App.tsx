import React from 'react';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { Chat } from './components/Chat';
import { ServerStatus } from './components/ServerStatus';
import { Toaster } from 'react-hot-toast';

function App() {
  const { room } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto flex gap-8">
        <div className="flex-1">
          {!room ? <Lobby /> : <Game />}
        </div>
        <Chat />
      </div>
      <ServerStatus />
    </div>
  );
}

export default App;