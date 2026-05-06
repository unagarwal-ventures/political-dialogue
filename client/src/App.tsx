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
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile/:username" element={<PublicProfilePage />} />

          <Route path="/quiz" element={
            <ProtectedRoute><QuizPage /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute><ResultsPage /></ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute><MatchingPage /></ProtectedRoute>
          } />
          <Route path="/dialogue/:matchId" element={
            <ProtectedRoute><DialoguePage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
