import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ_SECTIONS } from '@political-dialogue/shared';
import { apiFetch } from '../lib/api';
const DEFAULT_ANSWERS = Object.fromEntries(QUIZ_SECTIONS.flatMap((s) => s.questions.map((q) => [q.key, 50])));
export function QuizPage() {
    const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
    const [sectionIndex, setSectionIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const section = QUIZ_SECTIONS[sectionIndex];
    const totalSections = QUIZ_SECTIONS.length;
    const isLast = sectionIndex === totalSections - 1;
    const progress = ((sectionIndex + 1) / totalSections) * 100;
    const handleChange = (key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };
    const handleNext = () => {
        if (!isLast)
            setSectionIndex((i) => i + 1);
    };
    const handleBack = () => {
        if (sectionIndex > 0)
            setSectionIndex((i) => i - 1);
    };
    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        const { data, error: err } = await apiFetch('/api/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({ answers }),
        });
        if (err) {
            setError(err);
            setSubmitting(false);
            return;
        }
        if (data)
            navigate('/results');
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10 space-y-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-500", children: [_jsxs("span", { children: ["Section ", sectionIndex + 1, " of ", totalSections] }), _jsx("span", { children: section.title })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-violet-600 h-2 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: section.title }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Drag each slider to where your views fall. There are no right answers." })] }), _jsx("div", { className: "space-y-10", children: section.questions.map((q) => (_jsxs("div", { className: "card space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsx("p", { className: "text-blue-700 font-medium leading-snug", children: q.labelLeft }), _jsx("p", { className: "text-red-700 font-medium leading-snug text-right", children: q.labelRight })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("input", { type: "range", min: 0, max: 100, value: answers[q.key], onChange: (e) => handleChange(q.key, parseInt(e.target.value)), className: "w-full" }), _jsx("div", { className: "flex justify-center", children: _jsx("span", { className: "text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5", children: answers[q.key] < 40
                                            ? 'Leaning left'
                                            : answers[q.key] > 60
                                                ? 'Leaning right'
                                                : 'Center' }) })] })] }, q.key))) }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm", children: error })), _jsxs("div", { className: "flex justify-between pt-2", children: [_jsx("button", { onClick: handleBack, disabled: sectionIndex === 0, className: "btn-secondary", children: "Back" }), isLast ? (_jsx("button", { onClick: handleSubmit, disabled: submitting, className: "btn-primary", children: submitting ? 'Saving...' : 'See my results' })) : (_jsx("button", { onClick: handleNext, className: "btn-primary", children: "Next" }))] })] }));
}
