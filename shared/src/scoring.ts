import { AxisScores, OrientationLabel, PolicyAxis, QuizResult } from './types';
import { QUESTIONS } from './questions';

export function computeAxisScores(answers: Record<string, number>): AxisScores {
  const axes: PolicyAxis[] = ['economic', 'social', 'government', 'environment', 'foreign'];
  const scores = {} as AxisScores;

  for (const axis of axes) {
    const axisQuestions = QUESTIONS.filter((q) => q.axis === axis);
    const values = axisQuestions.map((q) => answers[q.key] ?? 50);
    scores[axis] = values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  return scores;
}

export function computeOverallScore(axisScores: AxisScores): number {
  const values = Object.values(axisScores);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function getOrientationLabel(overallScore: number): OrientationLabel {
  if (overallScore < 30) return 'left-leaning';
  if (overallScore < 43) return 'center-left';
  if (overallScore < 57) return 'centrist';
  if (overallScore < 70) return 'center-right';
  return 'right-leaning';
}

export function generateSummary(axisScores: AxisScores, label: OrientationLabel): string {
  const axisNames: Record<PolicyAxis, string> = {
    economic: 'economic policy',
    social: 'social issues',
    government: 'the role of government',
    environment: 'environment and energy',
    foreign: 'foreign policy',
  };

  const STRONG_LEFT = 25;
  const STRONG_RIGHT = 75;
  const CENTRIST_LOW = 40;
  const CENTRIST_HIGH = 60;

  const strongLeft: string[] = [];
  const strongRight: string[] = [];
  const centrist: string[] = [];

  for (const [axis, score] of Object.entries(axisScores) as [PolicyAxis, number][]) {
    if (score < STRONG_LEFT) strongLeft.push(axisNames[axis]);
    else if (score > STRONG_RIGHT) strongRight.push(axisNames[axis]);
    else if (score >= CENTRIST_LOW && score <= CENTRIST_HIGH) centrist.push(axisNames[axis]);
  }

  const labelDisplay: Record<OrientationLabel, string> = {
    'left-leaning': 'left-leaning',
    'center-left': 'center-left',
    centrist: 'centrist',
    'center-right': 'center-right',
    'right-leaning': 'right-leaning',
  };

  let summary = `Your views place you in the ${labelDisplay[label]} range overall. `;

  if (strongLeft.length > 0) {
    summary += `You hold more progressive views on ${strongLeft.join(' and ')}. `;
  }
  if (strongRight.length > 0) {
    summary += `You lean more conservative on ${strongRight.join(' and ')}. `;
  }
  if (centrist.length > 0) {
    summary += `You're closest to the center on ${centrist.join(' and ')}. `;
  }

  summary += 'Your profile reflects the nuance most people hold — not every view fits a single label.';

  return summary.trim();
}

export function computeQuizResult(answers: Record<string, number>): QuizResult {
  const axisScores = computeAxisScores(answers);
  const overallScore = computeOverallScore(axisScores);
  const orientationLabel = getOrientationLabel(overallScore);
  const summary = generateSummary(axisScores, orientationLabel);

  return { axisScores, overallScore, orientationLabel, summary };
}

export function computeAxisDiff(a: AxisScores, b: AxisScores): number {
  const axes: PolicyAxis[] = ['economic', 'social', 'government', 'environment', 'foreign'];
  const diffs = axes.map((axis) => Math.abs(a[axis] - b[axis]));
  return diffs.reduce((sum, d) => sum + d, 0) / axes.length;
}

export function findAgreeingAxes(a: AxisScores, b: AxisScores): PolicyAxis[] {
  const axes: PolicyAxis[] = ['economic', 'social', 'government', 'environment', 'foreign'];
  return axes.filter((axis) => Math.abs(a[axis] - b[axis]) < 20);
}
