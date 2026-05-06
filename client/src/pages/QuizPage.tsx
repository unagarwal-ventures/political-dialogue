import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ_SECTIONS } from '@political-dialogue/shared';
import { apiFetch } from '../lib/api';

const DEFAULT_ANSWERS = Object.fromEntries(
  QUIZ_SECTIONS.flatMap((s) => s.questions.map((q) => [q.key, 50]))
);

export function QuizPage() {
  const [answers, setAnswers] = useState<Record<string, number>>(DEFAULT_ANSWERS);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const section = QUIZ_SECTIONS[sectionIndex];
  const totalSections = QUIZ_SECTIONS.length;
  const isLast = sectionIndex === totalSections - 1;
  const progress = ((sectionIndex + 1) / totalSections) * 100;

  const handleChange = (key: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!isLast) setSectionIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (sectionIndex > 0) setSectionIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const { data, error: err } = await apiFetch<{ result: unknown }>('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });

    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }

    if (data) navigate('/results');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Section {sectionIndex + 1} of {totalSections}
          </span>
          <span>{section.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Section title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
        <p className="text-gray-500 text-sm mt-1">
          Drag each slider to where your views fall. There are no right answers.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-10">
        {section.questions.map((q) => (
          <div key={q.key} className="card space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p className="text-blue-700 font-medium leading-snug">{q.labelLeft}</p>
              <p className="text-red-700 font-medium leading-snug text-right">{q.labelRight}</p>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={100}
                value={answers[q.key]}
                onChange={(e) => handleChange(q.key, parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-center">
                <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">
                  {answers[q.key] < 40
                    ? 'Leaning left'
                    : answers[q.key] > 60
                    ? 'Leaning right'
                    : 'Center'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={handleBack}
          disabled={sectionIndex === 0}
          className="btn-secondary"
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Saving...' : 'See my results'}
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary">
            Next
          </button>
        )}
      </div>
    </div>
  );
}
