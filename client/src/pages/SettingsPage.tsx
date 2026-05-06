import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface ProfileData {
  display_name: string;
  username: string;
  is_profile_public: boolean;
  matching_opt_in: boolean;
  quiz_attempts: Array<{
    id: string;
    taken_at: string;
    is_current: boolean;
    overall_score: number;
    orientation_label: string;
  }>;
}

export function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<ProfileData>('/api/profile/me').then(({ data }) => {
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
    if (!profile) return;
    await apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ isProfilePublic: !profile.is_profile_public }),
    });
    setProfile((p) => p ? { ...p, is_profile_public: !p.is_profile_public } : p);
  };

  const toggleMatching = async () => {
    if (!profile) return;
    await apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ matchingOptIn: !profile.matching_opt_in }),
    });
    setProfile((p) => p ? { ...p, matching_opt_in: !p.matching_opt_in } : p);
  };

  if (!profile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Profile</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Display name</label>
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <p className="text-sm text-gray-400">@{profile.username}</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      {/* Privacy */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Public profile</p>
            <p className="text-xs text-gray-400">Allow others to view your political profile via link</p>
          </div>
          <button
            onClick={togglePublic}
            className={`relative w-11 h-6 rounded-full transition-colors ${profile.is_profile_public ? 'bg-violet-600' : 'bg-gray-200'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.is_profile_public ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Open to matching</p>
            <p className="text-xs text-gray-400">Allow the system to propose you as a match to others</p>
          </div>
          <button
            onClick={toggleMatching}
            className={`relative w-11 h-6 rounded-full transition-colors ${profile.matching_opt_in ? 'bg-violet-600' : 'bg-gray-200'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.matching_opt_in ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Quiz history */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Quiz history</h2>
          <Link to="/quiz" className="btn-secondary text-xs">Retake quiz</Link>
        </div>
        {profile.quiz_attempts.length === 0 ? (
          <p className="text-sm text-gray-400">No quiz attempts yet.</p>
        ) : (
          <div className="space-y-2">
            {profile.quiz_attempts.map((attempt) => (
              <div
                key={attempt.id}
                className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${attempt.is_current ? 'bg-violet-50' : 'bg-gray-50'}`}
              >
                <span className="text-gray-600">
                  {new Date(attempt.taken_at).toLocaleDateString()}
                </span>
                <span className="text-gray-700 font-medium capitalize">{attempt.orientation_label}</span>
                {attempt.is_current && (
                  <span className="text-xs text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
