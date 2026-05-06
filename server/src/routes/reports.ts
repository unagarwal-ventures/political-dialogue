import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const reportsRouter = Router();

// POST /api/reports — submit a report
reportsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { matchId, messageId, reportedUserId, reason } = req.body as {
    matchId: string;
    messageId?: string;
    reportedUserId: string;
    reason: string;
  };

  if (!matchId || !reportedUserId || !reason?.trim()) {
    res.status(400).json({ error: 'matchId, reportedUserId, and reason are required' });
    return;
  }

  if (reportedUserId === userId) {
    res.status(400).json({ error: 'Cannot report yourself' });
    return;
  }

  // Verify reporter is a match participant
  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('user_a_id, user_b_id')
    .eq('id', matchId)
    .single();

  if (!match || (match.user_a_id !== userId && match.user_b_id !== userId)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('reports')
    .insert({
      reporter_id: userId,
      reported_user_id: reportedUserId,
      match_id: matchId,
      message_id: messageId || null,
      reason: reason.trim(),
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: 'Failed to submit report' });
    return;
  }

  res.status(201).json({ data });
});
