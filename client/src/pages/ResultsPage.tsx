import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { SpectrumChart } from '../components/SpectrumChart';
import type { AxisScores, OrientationLabel } from '@political-dialogue/shared';

interface AttemptRow {
  economic_score: number;
  social_score: number;
  government_score: number;
  environment_score: number;
  foreign_score: number;
  overall_score: number;
  orientation_label: OrientationLabel;
  summary: string;
  is_current: boolean;
}

interface ProfileData {
  username: string;
  quiz_attempts: AttemptRow[];
}

const ORIENTATION_COLORS: Record<OrientationLabel, string> = {
  'left-leaning': 'bg-blue-100 text-blue-800',
  'center-left': 'bg-blue-50 text-blue-700',
  centrist: 'bg-violet-100 text-violet-800',
  'center-right': 'bg-red-50 text-red-700',
  'right-leaning': 'bg-red-100 text-red-800',
};

const ORIENTATION_LABELS: Record<OrientationLabel, string> = {
  'left-leaning': 'Left-Leaning',
  'center-left': 'Center-Left',
  centrist: 'Centrist',
  'center-right': 'Center-Right',
  'right-leaning': 'Right-Leaning',
};

export function ResultsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<ProfileData>('/api/profile/me').then(({ data }) => {
      setProfile(data ?? null);
      setLoading(false);
    });
  }, []);

  const copyLink = () => {
    if (!profile) return;
    const url = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const attempt = profile?.quiz_attempts?.find((a) => a.is_current) ?? profile?.quiz_attempts?.[0];

  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">No quiz results yet.</p>
        <Link to="/quiz" className="btn-primary">Take the quiz</Link>
      </div>
    );
  }

  const axisScores: AxisScores = {
    economic: attempt.economic_score,
    social: attempt.social_score,
    government: attempt.government_score,
    environment: attempt.environment_score,
    foreign: attempt.foreign_score,
  };

  const label = attempt.orientation_label;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Orientation banner */}
      <div className="card text-center space-y-2">
        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Your political orientation</p>
        <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold ${ORIENTATION_COLORS[label]}`}>
          {ORIENTATION_LABELS[label]}
        </div>
        <p className="text-sm text-gray-600 max-w-md mx-auto pt-1">{attempt.summary}</p>
      </div>

      {/* Spectrum chart */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Your profile by issue area</h2>
        <SpectrumChart scores={axisScores} />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={copyLink} className="btn-secondary flex-1">
          {copied ? 'Link copied!' : 'Share my profile'}
        </button>
        <Link to="/matches" className="btn-primary flex-1 text-center">
          Find a dialogue partner
        </Link>
        <Link to="/quiz" className="btn-secondary flex-1 text-center text-xs">
          Retake quiz
        </Link>
      </div>
    </div>
  );
}
