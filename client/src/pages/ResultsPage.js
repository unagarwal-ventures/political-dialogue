import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { SpectrumChart } from '../components/SpectrumChart';
const ORIENTATION_COLORS = {
    'left-leaning': 'bg-blue-100 text-blue-800',
    'center-left': 'bg-blue-50 text-blue-700',
    centrist: 'bg-violet-100 text-violet-800',
    'center-right': 'bg-red-50 text-red-700',
    'right-leaning': 'bg-red-100 text-red-800',
};
const ORIENTATION_LABELS = {
    'left-leaning': 'Left-Leaning',
    'center-left': 'Center-Left',
    centrist: 'Centrist',
    'center-right': 'Center-Right',
    'right-leaning': 'Right-Leaning',
};
export function ResultsPage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        apiFetch('/api/profile/me').then(({ data }) => {
            setProfile(data ?? null);
            setLoading(false);
        });
    }, []);
    const copyLink = () => {
        if (!profile)
            return;
        const url = `${window.location.origin}/profile/${profile.username}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    const attempt = profile?.quiz_attempts?.find((a) => a.is_current) ?? profile?.quiz_attempts?.[0];
    if (!attempt) {
        return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-16 text-center space-y-4", children: [_jsx("p", { className: "text-gray-500", children: "No quiz results yet." }), _jsx(Link, { to: "/quiz", className: "btn-primary", children: "Take the quiz" })] }));
    }
    const axisScores = {
        economic: attempt.economic_score,
        social: attempt.social_score,
        government: attempt.government_score,
        environment: attempt.environment_score,
        foreign: attempt.foreign_score,
    };
    const label = attempt.orientation_label;
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10 space-y-8", children: [_jsxs("div", { className: "card text-center space-y-2", children: [_jsx("p", { className: "text-sm text-gray-500 uppercase tracking-wide font-medium", children: "Your political orientation" }), _jsx("div", { className: `inline-block px-6 py-2 rounded-full text-lg font-bold ${ORIENTATION_COLORS[label]}`, children: ORIENTATION_LABELS[label] }), _jsx("p", { className: "text-sm text-gray-600 max-w-md mx-auto pt-1", children: attempt.summary })] }), _jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "Your profile by issue area" }), _jsx(SpectrumChart, { scores: axisScores })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsx("button", { onClick: copyLink, className: "btn-secondary flex-1", children: copied ? 'Link copied!' : 'Share my profile' }), _jsx(Link, { to: "/matches", className: "btn-primary flex-1 text-center", children: "Find a dialogue partner" }), _jsx(Link, { to: "/quiz", className: "btn-secondary flex-1 text-center text-xs", children: "Retake quiz" })] })] }));
}
