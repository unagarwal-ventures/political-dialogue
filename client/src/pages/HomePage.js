import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export function HomePage() {
    const { user } = useAuth();
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-4 py-20 text-center space-y-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h1", { className: "text-5xl font-bold text-gray-900 leading-tight", children: ["Find common ground across", ' ', _jsx("span", { className: "text-violet-600", children: "the divide" })] }), _jsx("p", { className: "text-xl text-gray-500 max-w-xl mx-auto", children: "Take a 13-question quiz, discover where you stand, and connect with someone who sees the world differently \u2014 for conversation, not debate." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Link, { to: "/quiz", className: "btn-primary text-base px-8 py-3", children: "Take the quiz" }), !user && (_jsx(Link, { to: "/auth", className: "btn-secondary text-base px-8 py-3", children: "Sign in" }))] }), _jsx("div", { className: "grid grid-cols-3 gap-6 pt-12", children: [
                    {
                        icon: '📊',
                        title: '13 questions',
                        desc: 'Covering economics, social issues, government, environment, and foreign policy',
                    },
                    {
                        icon: '🎯',
                        title: 'Your political profile',
                        desc: 'See exactly where you stand on each axis — no partisan labels',
                    },
                    {
                        icon: '🤝',
                        title: 'Matched dialogue',
                        desc: 'Connect with someone across the spectrum for civil, structured conversation',
                    },
                ].map((item) => (_jsxs("div", { className: "card text-left space-y-2", children: [_jsx("div", { className: "text-3xl", children: item.icon }), _jsx("div", { className: "font-semibold text-gray-800", children: item.title }), _jsx("p", { className: "text-sm text-gray-500", children: item.desc })] }, item.title))) }), _jsx("div", { className: "card bg-violet-50 border-violet-100 text-left mt-8", children: _jsx("p", { className: "text-sm text-violet-800 italic", children: "\"The goal is not to change minds \u2014 it's to understand how someone you disagree with arrived at their views, and to be genuinely understood in return.\"" }) })] }));
}
