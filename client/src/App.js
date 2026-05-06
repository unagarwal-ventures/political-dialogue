import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { QuizPage } from './pages/QuizPage';
import { ResultsPage } from './pages/ResultsPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { MatchingPage } from './pages/MatchingPage';
import { DialoguePage } from './pages/DialoguePage';
import { SettingsPage } from './pages/SettingsPage';
export default function App() {
    return (_jsxs(BrowserRouter, { children: [_jsx(Navbar, {}), _jsx("main", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/auth", element: _jsx(AuthPage, {}) }), _jsx(Route, { path: "/profile/:username", element: _jsx(PublicProfilePage, {}) }), _jsx(Route, { path: "/quiz", element: _jsx(ProtectedRoute, { children: _jsx(QuizPage, {}) }) }), _jsx(Route, { path: "/results", element: _jsx(ProtectedRoute, { children: _jsx(ResultsPage, {}) }) }), _jsx(Route, { path: "/matches", element: _jsx(ProtectedRoute, { children: _jsx(MatchingPage, {}) }) }), _jsx(Route, { path: "/dialogue/:matchId", element: _jsx(ProtectedRoute, { children: _jsx(DialoguePage, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { children: _jsx(SettingsPage, {}) }) })] }) })] }));
}
