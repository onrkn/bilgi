import React from 'react';
import { Home } from './components/Home';
import { GameRoom } from './components/GameRoom';
import { useGameStore } from './store/gameStore';

function App() {
  const { room } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-100">
      {room ? <GameRoom /> : <Home />}
    </div>
  );
}

export default App;