import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const profileRouter = Router();

// GET /api/profile/me — full own profile
profileRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, username, display_name, avatar_url, is_profile_public, matching_opt_in, created_at,
      quiz_attempts!inner(
        id, taken_at, is_current, economic_score, social_score, government_score,
        environment_score, foreign_score, overall_score, orientation_label, summary
      )
    `)
    .eq('id', req.userId!)
    .eq('quiz_attempts.is_current', true)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json({ data });
});

// GET /api/profile/:username — public profile
profileRouter.get('/:username', async (req, res) => {
  const { username } = req.params;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, username, display_name, avatar_url, is_profile_public, created_at,
      quiz_attempts(
        economic_score, social_score, government_score,
        environment_score, foreign_score, overall_score, orientation_label, summary
      )
    `)
    .eq('username', username)
    .eq('quiz_attempts.is_current', true)
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  if (!data.is_profile_public) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json({ data });
});

// PUT /api/profile — update own profile
profileRouter.put('/', requireAuth, async (req: AuthRequest, res) => {
  const { displayName, avatarUrl, isProfilePublic, matchingOptIn } = req.body as {
    displayName?: string;
    avatarUrl?: string;
    isProfilePublic?: boolean;
    matchingOptIn?: boolean;
  };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (displayName !== undefined) updates.display_name = displayName;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
  if (isProfilePublic !== undefined) updates.is_profile_public = isProfilePublic;
  if (matchingOptIn !== undefined) updates.matching_opt_in = matchingOptIn;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', req.userId!)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: 'Failed to update profile' });
    return;
  }

  res.json({ data });
});
