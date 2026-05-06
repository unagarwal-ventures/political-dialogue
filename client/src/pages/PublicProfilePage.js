import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { SpectrumChart } from '../components/SpectrumChart';
const ORIENTATION_LABELS = {
    'left-leaning': 'Left-Leaning',
    'center-left': 'Center-Left',
    centrist: 'Centrist',
    'center-right': 'Center-Right',
    'right-leaning': 'Right-Leaning',
};
export function PublicProfilePage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    useEffect(() => {
        if (!username)
            return;
        apiFetch(`/api/profile/${username}`).then(({ data, error }) => {
            if (error || !data)
                setNotFound(true);
            else
                setProfile(data);
            setLoading(false);
        });
    }, [username]);
    if (loading) {
        return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    if (notFound || !profile) {
        return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-16 text-center space-y-4", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-700", children: "Profile not found" }), _jsx("p", { className: "text-gray-400 text-sm", children: "This profile is private or doesn't exist." }), _jsx(Link, { to: "/", className: "btn-secondary", children: "Go home" })] }));
    }
    const attempt = profile.quiz_attempts?.[0];
    if (!attempt) {
        return (_jsx("div", { className: "max-w-2xl mx-auto px-4 py-16 text-center", children: _jsxs("p", { className: "text-gray-500", children: [profile.display_name, " hasn't completed the quiz yet."] }) }));
    }
    const axisScores = {
        economic: attempt.economic_score,
        social: attempt.social_score,
        government: attempt.government_score,
        environment: attempt.environment_score,
        foreign: attempt.foreign_score,
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10 space-y-8", children: [_jsxs("div", { className: "text-center space-y-1", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: profile.display_name }), _jsxs("p", { className: "text-gray-400 text-sm", children: ["@", profile.username] }), _jsx("div", { className: "inline-block mt-2 px-4 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium", children: ORIENTATION_LABELS[attempt.orientation_label] })] }), _jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "Political profile" }), _jsx(SpectrumChart, { scores: axisScores })] }), _jsx("div", { className: "card bg-gray-50", children: _jsx("p", { className: "text-sm text-gray-600", children: attempt.summary }) })] }));
}
