import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Send } from 'lucide-react';

export const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const messages = useGameStore((state) => state.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Socket emit will be handled here
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[400px] flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-bold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.type === 'system'
                ? 'text-gray-500 italic text-sm'
                : 'bg-blue-100 p-2 rounded'
            }`}
          >
            {msg.type === 'user' && (
              <span className="font-bold">{msg.sender}: </span>
            )}
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};