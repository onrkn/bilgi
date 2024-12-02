import React from 'react';
import { GameRoom } from './components/GameRoom';
import { Question } from './components/Question';
import { Chat } from './components/Chat';
import { ServerStatus } from './components/ServerStatus';
import { UserSetup } from './components/UserSetup';
import { useGameStore } from './store/gameStore';
import { Toaster } from 'react-hot-toast';

function App() {
  const { gameStatus, roomCode } = useGameStore();

  if (!roomCode) {
    return (
      <>
        <UserSetup />
        <ServerStatus />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <GameRoom />
        
        {gameStatus === 'playing' && <Question />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Chat />
        </div>
      </div>
      
      <ServerStatus />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;