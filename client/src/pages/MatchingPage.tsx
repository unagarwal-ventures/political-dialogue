import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { SpectrumChart } from '../components/SpectrumChart';
import type { AxisScores, PolicyAxis } from '@political-dialogue/shared';
import { AXIS_TITLES } from '@political-dialogue/shared';

interface MatchUser {
  id: string;
  username: string;
  display_name: string;
  quiz_attempts: Array<{
    economic_score: number;
    social_score: number;
    government_score: number;
    environment_score: number;
    foreign_score: number;
    overall_score: number;
    orientation_label: string;
  }>;
}

interface Match {
  id: string;
  status: string;
  avg_score_diff: number;
  agreeing_axes: PolicyAxis[];
  created_at: string;
  user_a: MatchUser;
  user_b: MatchUser;
}

interface MyProfile {
  id: string;
  matching_opt_in: boolean;
  quiz_attempts: Array<{ economic_score: number; social_score: number; government_score: number; environment_score: number; foreign_score: number; is_current: boolean }>;
}

function toAxisScores(attempt: { economic_score: number; social_score: number; government_score: number; environment_score: number; foreign_score: number }): AxisScores {
  return {
    economic: attempt.economic_score,
    social: attempt.social_score,
    government: attempt.government_score,
    environment: attempt.environment_score,
    foreign: attempt.foreign_score,
  };
}

function MatchCard({ match, myUserId, onRespond }: { match: Match; myUserId: string; onRespond: () => void }) {
  const [responding, setResponding] = useState(false);
  const partner = match.user_a.id === myUserId ? match.user_b : match.user_a;
  const myAttempt = match.user_a.id === myUserId ? match.user_a.quiz_attempts[0] : match.user_b.quiz_attempts[0];
  const theirAttempt = partner.quiz_attempts[0];

  const respond = async (action: 'accept' | 'decline') => {
    setResponding(true);
    await apiFetch(`/api/matches/${match.id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    onRespond();
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{partner.display_name}</p>
          <p className="text-xs text-gray-400">@{partner.username}</p>
        </div>
        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
          ~{Math.round(match.avg_score_diff)} pts apart
        </span>
      </div>

      {match.agreeing_axes.length > 0 && (
        <p className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
          You agree on: {match.agreeing_axes.map((a) => AXIS_TITLES[a]).join(', ')}
        </p>
      )}

      {myAttempt && theirAttempt && (
        <SpectrumChart
          scores={toAxisScores(myAttempt)}
          compareScores={toAxisScores(theirAttempt)}
          showLabels={false}
        />
      )}

      {match.status === 'pending' && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => respond('accept')}
            disabled={responding}
            className="btn-primary flex-1"
          >
            Start conversation
          </button>
          <button
            onClick={() => respond('decline')}
            disabled={responding}
            className="btn-secondary flex-1"
          >
            Pass
          </button>
        </div>
      )}

      {match.status === 'active' && (
        <Link to={`/dialogue/${match.id}`} className="btn-primary block text-center">
          Open conversation
        </Link>
      )}

      {(match.status === 'declined_by_a' || match.status === 'declined_by_b') && (
        <p className="text-xs text-gray-400 text-center">This match was declined.</p>
      )}
    </div>
  );
}

export function MatchingPage() {
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [findError, setFindError] = useState<string | null>(null);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);

  const loadData = async () => {
    const [profileRes, matchesRes] = await Promise.all([
      apiFetch<MyProfile>('/api/profile/me'),
      apiFetch<Match[]>('/api/matches'),
    ]);
    setMyProfile(profileRes.data ?? null);
    setMatches(matchesRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleOptIn = async () => {
    if (!myProfile) return;
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
    if (error) setFindError(error);
    else {
      await loadData();
    }
    setFinding(false);
  };

  const handleDecline = (partnerId: string) => {
    setExcludeIds((prev) => [...prev, partnerId]);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasQuiz = (myProfile?.quiz_attempts?.length ?? 0) > 0;
  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const activeMatches = matches.filter((m) => m.status === 'active');

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Find a dialogue partner</h1>
        <p className="text-gray-500 text-sm">
          We match you with someone who sees things differently — with the goal of mutual understanding.
        </p>
      </div>

      {!hasQuiz ? (
        <div className="card text-center space-y-4">
          <p className="text-gray-600">Complete the quiz first to find a match.</p>
          <Link to="/quiz" className="btn-primary">Take the quiz</Link>
        </div>
      ) : (
        <>
          {/* Opt-in toggle */}
          <div className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Open to matching</p>
              <p className="text-xs text-gray-400">Others can be matched with you</p>
            </div>
            <button
              onClick={toggleOptIn}
              className={`relative w-11 h-6 rounded-full transition-colors ${myProfile?.matching_opt_in ? 'bg-violet-600' : 'bg-gray-200'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${myProfile?.matching_opt_in ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>

          {/* Find a match */}
          {myProfile?.matching_opt_in && (
            <div className="flex flex-col gap-2">
              <button onClick={findMatch} disabled={finding} className="btn-primary w-full">
                {finding ? 'Searching...' : 'Find a new match'}
              </button>
              {findError && <p className="text-red-600 text-sm text-center">{findError}</p>}
            </div>
          )}

          {/* Pending matches */}
          {pendingMatches.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800">Proposed matches</h2>
              {pendingMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  myUserId={myProfile!.id}
                  onRespond={() => { handleDecline(''); loadData(); }}
                />
              ))}
            </div>
          )}

          {/* Active conversations */}
          {activeMatches.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800">Active conversations</h2>
              {activeMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  myUserId={myProfile!.id}
                  onRespond={loadData}
                />
              ))}
            </div>
          )}

          {pendingMatches.length === 0 && activeMatches.length === 0 && (
            <div className="card text-center text-gray-500 text-sm">
              No matches yet. Click "Find a new match" to get started.
            </div>
          )}
        </>
      )}
    </div>
  );
}
