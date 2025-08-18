"use client";

import { useState } from 'react';
import Button from './ui/Button';

/**
 * SimuladoQuestionCard component
 *
 * Renders a question and its options. The selected option is stored
 * internally until the user submits their answer via the Responder
 * button. The parent component receives the index of the chosen
 * answer through the onAnswer callback.
 */
export default function SimuladoQuestionCard({ question, options, onAnswer }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-medium mb-4 text-lg">{question}</h3>
      <div className="space-y-2">
        {options.map((opt, index) => (
          <div
            key={index}
            onClick={() => setSelected(index)}
            className={`p-3 border rounded-md cursor-pointer transition-colors duration-200 ${
              selected === index ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {opt}
          </div>
        ))}
      </div>
      <Button
        className="mt-4"
        onClick={() => {
          if (selected !== null) {
            onAnswer(selected);
            setSelected(null);
          }
        }}
        disabled={selected === null}
      >
        Responder
      </Button>
    </div>
  );
}
