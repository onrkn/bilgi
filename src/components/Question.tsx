import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const Question: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const { currentQuestion, answers } = useGameStore();

  if (!currentQuestion) return null;

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    // Socket emit will be handled here
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg space-y-6">
      <h3 className="text-xl font-bold">{currentQuestion.question}</h3>

      <div className="grid grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            className={`p-4 rounded-lg text-left transition ${
              selectedAnswer === index
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {Object.keys(answers).length > 0 && (
        <div className="text-center text-gray-600">
          {Object.keys(answers).length} player(s) have answered
        </div>
      )}
    </div>
  );
};