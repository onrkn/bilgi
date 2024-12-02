import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MessageCircle } from 'lucide-react';

export const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const { room, addMessage } = useGameStore();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'chat' as const,
      sender: 'Player',
      content: message,
      timestamp: Date.now(),
    };

    addMessage(newMessage);
    setMessage('');
  };

  return (
    <div className="w-80 h-[600px] bg-white rounded-lg shadow-lg flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h2 className="font-semibold">Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {room?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.type === 'system' ? 'text-gray-500 italic' : 'text-gray-800'
            }`}
          >
            {msg.type === 'chat' && (
              <span className="font-semibold">{msg.sender}: </span>
            )}
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};