import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { SpectrumChart } from '../components/SpectrumChart';
import { AXIS_TITLES } from '@political-dialogue/shared';
function toAxisScores(attempt) {
    return {
        economic: attempt.economic_score,
        social: attempt.social_score,
        government: attempt.government_score,
        environment: attempt.environment_score,
        foreign: attempt.foreign_score,
    };
}
function MatchCard({ match, myUserId, onRespond }) {
    const [responding, setResponding] = useState(false);
    const partner = match.user_a.id === myUserId ? match.user_b : match.user_a;
    const myAttempt = match.user_a.id === myUserId ? match.user_a.quiz_attempts[0] : match.user_b.quiz_attempts[0];
    const theirAttempt = partner.quiz_attempts[0];
    const respond = async (action) => {
        setResponding(true);
        await apiFetch(`/api/matches/${match.id}/respond`, {
            method: 'POST',
            body: JSON.stringify({ action }),
        });
        onRespond();
    };
    return (_jsxs("div", { className: "card space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: partner.display_name }), _jsxs("p", { className: "text-xs text-gray-400", children: ["@", partner.username] })] }), _jsxs("span", { className: "text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full", children: ["~", Math.round(match.avg_score_diff), " pts apart"] })] }), match.agreeing_axes.length > 0 && (_jsxs("p", { className: "text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg", children: ["You agree on: ", match.agreeing_axes.map((a) => AXIS_TITLES[a]).join(', ')] })), myAttempt && theirAttempt && (_jsx(SpectrumChart, { scores: toAxisScores(myAttempt), compareScores: toAxisScores(theirAttempt), showLabels: false })), match.status === 'pending' && (_jsxs("div", { className: "flex gap-3 pt-1", children: [_jsx("button", { onClick: () => respond('accept'), disabled: responding, className: "btn-primary flex-1", children: "Start conversation" }), _jsx("button", { onClick: () => respond('decline'), disabled: responding, className: "btn-secondary flex-1", children: "Pass" })] })), match.status === 'active' && (_jsx(Link, { to: `/dialogue/${match.id}`, className: "btn-primary block text-center", children: "Open conversation" })), (match.status === 'declined_by_a' || match.status === 'declined_by_b') && (_jsx("p", { className: "text-xs text-gray-400 text-center", children: "This match was declined." }))] }));
}
export function MatchingPage() {
    const [myProfile, setMyProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [finding, setFinding] = useState(false);
    const [findError, setFindError] = useState(null);
    const [excludeIds, setExcludeIds] = useState([]);
    const loadData = async () => {
        const [profileRes, matchesRes] = await Promise.all([
            apiFetch('/api/profile/me'),
            apiFetch('/api/matches'),
        ]);
        setMyProfile(profileRes.data ?? null);
        setMatches(matchesRes.data ?? []);
        setLoading(false);
    };
    useEffect(() => { loadData(); }, []);
    const toggleOptIn = async () => {
        if (!myProfile)
            return;
        await apiFetch('/api/profile', {
            method: 'PUT',
            body: JSON.stringify({ matchingOptIn: !myProfile.matching_opt_in }),
        });
        await loadData();
    };
    const findMatch = async () => {
        setFinding(true);
        setFindError(null);
        const { error } = await apiFetch('/api/matches/find', {
            method: 'POST',
            body: JSON.stringify({ excludeIds }),
        });
        if (error)
            setFindError(error);
        else {
            await loadData();
        }
        setFinding(false);
    };
    const handleDecline = (partnerId) => {
        setExcludeIds((prev) => [...prev, partnerId]);
        loadData();
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    const hasQuiz = (myProfile?.quiz_attempts?.length ?? 0) > 0;
    const pendingMatches = matches.filter((m) => m.status === 'pending');
    const activeMatches = matches.filter((m) => m.status === 'active');
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10 space-y-8", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Find a dialogue partner" }), _jsx("p", { className: "text-gray-500 text-sm", children: "We match you with someone who sees things differently \u2014 with the goal of mutual understanding." })] }), !hasQuiz ? (_jsxs("div", { className: "card text-center space-y-4", children: [_jsx("p", { className: "text-gray-600", children: "Complete the quiz first to find a match." }), _jsx(Link, { to: "/quiz", className: "btn-primary", children: "Take the quiz" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "card flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-800", children: "Open to matching" }), _jsx("p", { className: "text-xs text-gray-400", children: "Others can be matched with you" })] }), _jsx("button", { onClick: toggleOptIn, className: `relative w-11 h-6 rounded-full transition-colors ${myProfile?.matching_opt_in ? 'bg-violet-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${myProfile?.matching_opt_in ? 'translate-x-5' : ''}` }) })] }), myProfile?.matching_opt_in && (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("button", { onClick: findMatch, disabled: finding, className: "btn-primary w-full", children: finding ? 'Searching...' : 'Find a new match' }), findError && _jsx("p", { className: "text-red-600 text-sm text-center", children: findError })] })), pendingMatches.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "Proposed matches" }), pendingMatches.map((m) => (_jsx(MatchCard, { match: m, myUserId: myProfile.id, onRespond: () => { handleDecline(''); loadData(); } }, m.id)))] })), activeMatches.length > 0 && (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "Active conversations" }), activeMatches.map((m) => (_jsx(MatchCard, { match: m, myUserId: myProfile.id, onRespond: loadData }, m.id)))] })), pendingMatches.length === 0 && activeMatches.length === 0 && (_jsx("div", { className: "card text-center text-gray-500 text-sm", children: "No matches yet. Click \"Find a new match\" to get started." }))] }))] }));
}
