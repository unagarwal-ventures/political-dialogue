import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { SpectrumChart } from '../components/SpectrumChart';
import type { AxisScores, OrientationLabel } from '@political-dialogue/shared';

interface PublicProfile {
  username: string;
  display_name: string;
  quiz_attempts: Array<{
    economic_score: number;
    social_score: number;
    government_score: number;
    environment_score: number;
    foreign_score: number;
    overall_score: number;
    orientation_label: OrientationLabel;
    summary: string;
  }>;
}

const ORIENTATION_LABELS: Record<OrientationLabel, string> = {
  'left-leaning': 'Left-Leaning',
  'center-left': 'Center-Left',
  centrist: 'Centrist',
  'center-right': 'Center-Right',
  'right-leaning': 'Right-Leaning',
};

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    apiFetch<PublicProfile>(`/api/profile/${username}`).then(({ data, error }) => {
      if (error || !data) setNotFound(true);
      else setProfile(data);
      setLoading(false);
    });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Profile not found</h2>
        <p className="text-gray-400 text-sm">This profile is private or doesn't exist.</p>
        <Link to="/" className="btn-secondary">Go home</Link>
      </div>
    );
  }

  const attempt = profile.quiz_attempts?.[0];
  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{profile.display_name} hasn't completed the quiz yet.</p>
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
        <p className="text-gray-400 text-sm">@{profile.username}</p>
        <div className="inline-block mt-2 px-4 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
          {ORIENTATION_LABELS[attempt.orientation_label]}
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Political profile</h2>
        <SpectrumChart scores={axisScores} />
      </div>

      <div className="card bg-gray-50">
        <p className="text-sm text-gray-600">{attempt.summary}</p>
      </div>
    </div>
  );
}
