import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
export function SettingsPage() {
    const [profile, setProfile] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        apiFetch('/api/profile/me').then(({ data }) => {
            if (data) {
                setProfile(data);
                setDisplayName(data.display_name);
            }
        });
    }, []);
    const save = async () => {
        setSaving(true);
        await apiFetch('/api/profile', {
            method: 'PUT',
            body: JSON.stringify({ displayName }),
        });
        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 2000);
    };
    const togglePublic = async () => {
        if (!profile)
            return;
        await apiFetch('/api/profile', {
            method: 'PUT',
            body: JSON.stringify({ isProfilePublic: !profile.is_profile_public }),
        });
        setProfile((p) => p ? { ...p, is_profile_public: !p.is_profile_public } : p);
    };
    const toggleMatching = async () => {
        if (!profile)
            return;
        await apiFetch('/api/profile', {
            method: 'PUT',
            body: JSON.stringify({ matchingOptIn: !profile.matching_opt_in }),
        });
        setProfile((p) => p ? { ...p, matching_opt_in: !p.matching_opt_in } : p);
    };
    if (!profile) {
        return (_jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10 space-y-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Settings" }), _jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "Profile" }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Display name" }), _jsx("input", { className: "input", value: displayName, onChange: (e) => setDisplayName(e.target.value) })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Username" }), _jsxs("p", { className: "text-sm text-gray-400", children: ["@", profile.username] })] }), _jsx("button", { onClick: save, disabled: saving, className: "btn-primary", children: saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes' })] }), _jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "Privacy" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Public profile" }), _jsx("p", { className: "text-xs text-gray-400", children: "Allow others to view your political profile via link" })] }), _jsx("button", { onClick: togglePublic, className: `relative w-11 h-6 rounded-full transition-colors ${profile.is_profile_public ? 'bg-violet-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.is_profile_public ? 'translate-x-5' : ''}` }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Open to matching" }), _jsx("p", { className: "text-xs text-gray-400", children: "Allow the system to propose you as a match to others" })] }), _jsx("button", { onClick: toggleMatching, className: `relative w-11 h-6 rounded-full transition-colors ${profile.matching_opt_in ? 'bg-violet-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.matching_opt_in ? 'translate-x-5' : ''}` }) })] })] }), _jsxs("div", { className: "card space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "font-semibold text-gray-800", children: "Quiz history" }), _jsx(Link, { to: "/quiz", className: "btn-secondary text-xs", children: "Retake quiz" })] }), profile.quiz_attempts.length === 0 ? (_jsx("p", { className: "text-sm text-gray-400", children: "No quiz attempts yet." })) : (_jsx("div", { className: "space-y-2", children: profile.quiz_attempts.map((attempt) => (_jsxs("div", { className: `flex items-center justify-between text-sm px-3 py-2 rounded-lg ${attempt.is_current ? 'bg-violet-50' : 'bg-gray-50'}`, children: [_jsx("span", { className: "text-gray-600", children: new Date(attempt.taken_at).toLocaleDateString() }), _jsx("span", { className: "text-gray-700 font-medium capitalize", children: attempt.orientation_label }), attempt.is_current && (_jsx("span", { className: "text-xs text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full", children: "Current" }))] }, attempt.id))) }))] })] }));
}
