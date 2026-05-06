import { Router } from 'express';
import { QUIZ_SECTIONS } from '@political-dialogue/shared';
import { computeQuizResult } from '@political-dialogue/shared';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export const quizRouter = Router();

// GET /api/quiz/questions — static question definitions
quizRouter.get('/questions', (_req, res) => {
  res.json({ data: QUIZ_SECTIONS });
});

// POST /api/quiz/submit — submit answers, compute scores, store attempt
quizRouter.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  const { answers } = req.body as { answers: Record<string, number> };

  if (!answers || typeof answers !== 'object') {
    res.status(400).json({ error: 'answers object required' });
    return;
  }

  // Validate all values are 0-100
  for (const [key, val] of Object.entries(answers)) {
    if (typeof val !== 'number' || val < 0 || val > 100) {
      res.status(400).json({ error: `Invalid value for question ${key}` });
      return;
    }
  }

  const result = computeQuizResult(answers);
  const userId = req.userId!;

  // Mark previous attempts as not current
  await supabaseAdmin
    .from('quiz_attempts')
    .update({ is_current: false })
    .eq('user_id', userId)
    .eq('is_current', true);

  // Insert new attempt
  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      is_current: true,
      economic_score: result.axisScores.economic,
      social_score: result.axisScores.social,
      government_score: result.axisScores.government,
      environment_score: result.axisScores.environment,
      foreign_score: result.axisScores.foreign,
      overall_score: result.overallScore,
      orientation_label: result.orientationLabel,
      summary: result.summary,
    })
    .select()
    .single();

  if (attemptError || !attempt) {
    res.status(500).json({ error: 'Failed to save quiz attempt' });
    return;
  }

  // Insert individual answers
  const answerRows = Object.entries(answers).map(([key, val]) => ({
    attempt_id: attempt.id,
    question_key: key,
    answer_value: val,
  }));

  const { error: answersError } = await supabaseAdmin.from('quiz_answers').insert(answerRows);

  if (answersError) {
    res.status(500).json({ error: 'Failed to save quiz answers' });
    return;
  }

  res.json({ data: { attemptId: attempt.id, result } });
});

// GET /api/quiz/history — past attempts for current user
quizRouter.get('/history', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from('quiz_attempts')
    .select('id, taken_at, is_current, economic_score, social_score, government_score, environment_score, foreign_score, overall_score, orientation_label, summary')
    .eq('user_id', req.userId!)
    .order('taken_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: 'Failed to fetch quiz history' });
    return;
  }

  res.json({ data });
});
