import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Send } from 'lucide-react';

export const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const { room, addMessage } = useGameStore();

  const handleSend = () => {
    if (!message.trim()) return;
    
    addMessage({
      id: Date.now().toString(),
      text: message,
      type: 'chat',
      sender: 'You',
      timestamp: Date.now(),
    });
    setMessage('');
  };

  return (
    <div className="w-full h-[300px] bg-white rounded-lg shadow-md flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        {room?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${
              msg.type === 'system' ? 'text-gray-500 italic' : ''
            }`}
          >
            {msg.type === 'chat' && (
              <span className="font-bold">{msg.sender}: </span>
            )}
            {msg.text}
          </div>
        ))}
      </div>
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};