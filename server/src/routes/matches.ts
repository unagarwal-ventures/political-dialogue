import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { computeAxisDiff, findAgreeingAxes } from '@political-dialogue/shared';
import type { AxisScores } from '@political-dialogue/shared';

export const matchesRouter = Router();

function toAxisScores(row: Record<string, number>): AxisScores {
  return {
    economic: row.economic_score,
    social: row.social_score,
    government: row.government_score,
    environment: row.environment_score,
    foreign: row.foreign_score,
  };
}

function normalizeMatchPair(userAId: string, userBId: string): [string, string] {
  return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
}

// POST /api/matches/find — find a new match for the current user
matchesRouter.post('/find', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { excludeIds = [] } = req.body as { excludeIds?: string[] };

  // Get current user's quiz scores
  const { data: myAttempt, error: myErr } = await supabaseAdmin
    .from('quiz_attempts')
    .select('economic_score, social_score, government_score, environment_score, foreign_score, overall_score')
    .eq('user_id', userId)
    .eq('is_current', true)
    .maybeSingle();

  if (myErr || !myAttempt) {
    res.status(400).json({ error: 'Complete the quiz before matching' });
    return;
  }

  // Check user has opted in
  const { data: myUser } = await supabaseAdmin
    .from('users')
    .select('matching_opt_in')
    .eq('id', userId)
    .single();

  if (!myUser?.matching_opt_in) {
    res.status(400).json({ error: 'Enable matching in your settings first' });
    return;
  }

  // Get existing match partner IDs to exclude
  const { data: existingMatches } = await supabaseAdmin
    .from('matches')
    .select('user_a_id, user_b_id')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

  const excludedSet = new Set<string>(excludeIds);
  existingMatches?.forEach((m) => {
    excludedSet.add(m.user_a_id === userId ? m.user_b_id : m.user_a_id);
  });

  // Get all opted-in users with quiz scores (excluding current user and already-matched)
  const { data: candidates, error: candErr } = await supabaseAdmin
    .from('quiz_attempts')
    .select('user_id, economic_score, social_score, government_score, environment_score, foreign_score')
    .eq('is_current', true)
    .neq('user_id', userId)
    .not('user_id', 'in', `(${[...excludedSet].join(',') || 'null'})`)
    // Only users who opted in
    .in('user_id', supabaseAdmin.from('users').select('id').eq('matching_opt_in', true) as unknown as string[]);

  if (candErr) {
    res.status(500).json({ error: 'Failed to find candidates' });
    return;
  }

  if (!candidates || candidates.length === 0) {
    res.status(404).json({ error: 'No matches available right now — try again later' });
    return;
  }

  const myScores = toAxisScores(myAttempt as Record<string, number>);

  // Score each candidate
  const scored = candidates
    .map((c) => {
      const theirScores = toAxisScores(c as Record<string, number>);
      const diff = computeAxisDiff(myScores, theirScores);
      const agreeingAxes = findAgreeingAxes(myScores, theirScores);
      return { userId: c.user_id, diff, agreeingAxes, scores: theirScores };
    })
    .filter((c) => c.diff >= 25) // Must differ by at least 25 on average
    .sort((a, b) => {
      // Prefer candidates with at least one agreeing axis
      const aHasAgreement = a.agreeingAxes.length > 0 ? 1 : 0;
      const bHasAgreement = b.agreeingAxes.length > 0 ? 1 : 0;
      if (bHasAgreement !== aHasAgreement) return bHasAgreement - aHasAgreement;
      // Among those, prefer higher diff (more different views) to be interesting
      return b.diff - a.diff;
    });

  if (scored.length === 0) {
    res.status(404).json({ error: 'No suitable matches found right now' });
    return;
  }

  const best = scored[0];
  const [aId, bId] = normalizeMatchPair(userId, best.userId);

  // Insert match
  const { data: match, error: matchErr } = await supabaseAdmin
    .from('matches')
    .insert({
      user_a_id: aId,
      user_b_id: bId,
      initiator_id: userId,
      status: 'pending',
      avg_score_diff: best.diff,
      agreeing_axes: best.agreeingAxes,
    })
    .select()
    .single();

  if (matchErr) {
    // Could be a duplicate — return existing pending match info
    res.status(409).json({ error: 'A match with this user already exists' });
    return;
  }

  res.json({ data: match });
});

// GET /api/matches — list current user's matches
matchesRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const { data, error } = await supabaseAdmin
    .from('matches')
    .select(`
      id, status, avg_score_diff, agreeing_axes, created_at,
      user_a:users!matches_user_a_id_fkey(id, username, display_name, avatar_url),
      user_b:users!matches_user_b_id_fkey(id, username, display_name, avatar_url)
    `)
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
    return;
  }

  res.json({ data });
});

// GET /api/matches/:id — single match with quiz scores
matchesRouter.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('matches')
    .select(`
      id, status, avg_score_diff, agreeing_axes, created_at,
      user_a:users!matches_user_a_id_fkey(
        id, username, display_name, avatar_url,
        quiz_attempts(economic_score, social_score, government_score, environment_score, foreign_score, overall_score, orientation_label, summary)
      ),
      user_b:users!matches_user_b_id_fkey(
        id, username, display_name, avatar_url,
        quiz_attempts(economic_score, social_score, government_score, environment_score, foreign_score, overall_score, orientation_label, summary)
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  // Verify this user is part of the match
  const matchData = data as unknown as {
    user_a: { id: string };
    user_b: { id: string };
  };
  if (matchData.user_a.id !== userId && matchData.user_b.id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.json({ data });
});

// POST /api/matches/:id/respond — accept or decline
matchesRouter.post('/:id/respond', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { action } = req.body as { action: 'accept' | 'decline' };

  if (action !== 'accept' && action !== 'decline') {
    res.status(400).json({ error: 'action must be accept or decline' });
    return;
  }

  const { data: match, error: fetchErr } = await supabaseAdmin
    .from('matches')
    .select('id, user_a_id, user_b_id, status')
    .eq('id', id)
    .single();

  if (fetchErr || !match) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  if (match.user_a_id !== userId && match.user_b_id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (match.status !== 'pending') {
    res.status(400).json({ error: 'Match is not pending' });
    return;
  }

  let newStatus: string;
  if (action === 'accept') {
    newStatus = 'active';
  } else {
    newStatus = match.user_a_id === userId ? 'declined_by_a' : 'declined_by_b';
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('matches')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (updateErr) {
    res.status(500).json({ error: 'Failed to update match' });
    return;
  }

  res.json({ data: updated });
});
