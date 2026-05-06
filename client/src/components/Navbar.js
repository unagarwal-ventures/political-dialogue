import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };
    return (_jsx("nav", { className: "bg-white border-b border-gray-100 sticky top-0 z-10", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 h-14 flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-lg font-semibold text-violet-700 tracking-tight", children: "Common Ground" }), _jsx("div", { className: "flex items-center gap-4 text-sm", children: user ? (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/quiz", className: "text-gray-600 hover:text-gray-900", children: "Quiz" }), _jsx(Link, { to: "/matches", className: "text-gray-600 hover:text-gray-900", children: "Matches" }), _jsx(Link, { to: "/settings", className: "text-gray-600 hover:text-gray-900", children: "Settings" }), _jsx("button", { onClick: handleSignOut, className: "btn-secondary text-xs px-3 py-1.5", children: "Sign out" })] })) : (_jsx(Link, { to: "/auth", className: "btn-primary", children: "Get started" })) })] }) }));
}
