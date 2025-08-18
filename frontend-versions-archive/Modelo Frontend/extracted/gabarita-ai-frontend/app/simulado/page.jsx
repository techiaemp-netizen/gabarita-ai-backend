"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter } from 'next/navigation';
import ProgressBar from '../../components/ProgressBar';
import SimuladoQuestionCard from '../../components/SimuladoQuestionCard';

/**
 * Simulado page
 *
 * Presents the user with a series of questions in a mock exam. A
 * countdown timer and progress bar indicate how much time and how
 * many questions remain. At the end of the quiz a simple alert
 * displays the results. Replace the static questions with data from
 * Firestore or a remote API as needed.
 */
export default function SimuladoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const questions = [
    {
      question: 'Qual é a capital do Brasil?',
      options: ['Brasília', 'Rio de Janeiro', 'Salvador', 'São Paulo'],
      correct: 0,
    },
    {
      question: '2 + 2 = ?',
      options: ['3', '4', '5', '2'],
      correct: 1,
    },
    {
      question: 'A FGV é uma instituição de ensino?',
      options: ['Verdadeiro', 'Falso'],
      correct: 0,
    },
  ];
  const [index, setIndex] = useState(0);
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [time, setTime] = useState(30);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev > 0) {
          return prev - 1;
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (selected) => {
    const currentCorrect = questions[index].correct;
    if (selected === currentCorrect) {
      setAnswersCorrect((c) => c + 1);
    }
    // Move to next question or finish
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setTime(30);
    } else {
      alert(`Você acertou ${answersCorrect + (selected === currentCorrect ? 1 : 0)} de ${questions.length} perguntas!`);
      setIndex(0);
      setAnswersCorrect(0);
      setTime(30);
    }
  };

  return (
    <div className="p-4 space-y-4 flex-1">
      <div>
        <ProgressBar value={((index) / questions.length) * 100} />
        <div className="mt-2 text-sm text-gray-600">Tempo: {time}s</div>
      </div>
      <SimuladoQuestionCard
        question={questions[index].question}
        options={questions[index].options}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
