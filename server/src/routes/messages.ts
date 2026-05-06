import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const messagesRouter = Router();

async function verifyMatchParticipant(matchId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('matches')
    .select('user_a_id, user_b_id, status')
    .eq('id', matchId)
    .single();

  return !!data && (data.user_a_id === userId || data.user_b_id === userId);
}

// GET /api/messages/:matchId — paginated message history
messagesRouter.get('/:matchId', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const matchId = String(req.params.matchId);
  const before = typeof req.query.before === 'string' ? req.query.before : undefined;
  const limitStr = typeof req.query.limit === 'string' ? req.query.limit : '50';

  const isParticipant = await verifyMatchParticipant(matchId, userId);
  if (!isParticipant) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  let query = supabaseAdmin
    .from('messages')
    .select('id, sender_id, content, sent_at, is_deleted')
    .eq('match_id', matchId)
    .order('sent_at', { ascending: false })
    .limit(Math.min(parseInt(limitStr), 100));

  if (before) {
    query = query.lt('sent_at', before);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
    return;
  }

  res.json({ data: (data || []).reverse() });
});

// POST /api/messages/:matchId — send a message
messagesRouter.post('/:matchId', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const matchId = String(req.params.matchId);
  const { content } = req.body as { content: string };

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Message content required' });
    return;
  }

  if (content.length > 2000) {
    res.status(400).json({ error: 'Message too long (max 2000 characters)' });
    return;
  }

  // Verify match is active and user is a participant
  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('user_a_id, user_b_id, status')
    .eq('id', matchId)
    .single();

  if (!match || (match.user_a_id !== userId && match.user_b_id !== userId)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (match.status !== 'active') {
    res.status(400).json({ error: 'This conversation is not active' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({ match_id: matchId, sender_id: userId, content: content.trim() })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: 'Failed to send message' });
    return;
  }

  res.status(201).json({ data });
});

// DELETE /api/messages/:messageId — soft-delete own message
messagesRouter.delete('/:messageId', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const messageId = String(req.params.messageId);

  const { data: msg } = await supabaseAdmin
    .from('messages')
    .select('sender_id')
    .eq('id', messageId)
    .single();

  if (!msg || msg.sender_id !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { error } = await supabaseAdmin
    .from('messages')
    .update({ is_deleted: true })
    .eq('id', messageId);

  if (error) {
    res.status(500).json({ error: 'Failed to delete message' });
    return;
  }

  res.json({ data: { ok: true } });
});
