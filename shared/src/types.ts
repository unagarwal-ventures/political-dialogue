export type PolicyAxis = 'economic' | 'social' | 'government' | 'environment' | 'foreign';

export type OrientationLabel =
  | 'left-leaning'
  | 'center-left'
  | 'centrist'
  | 'center-right'
  | 'right-leaning';

export interface Question {
  key: string;
  axis: PolicyAxis;
  labelLeft: string;
  labelRight: string;
}

export interface QuizSection {
  axis: PolicyAxis;
  title: string;
  questions: Question[];
}

export interface AxisScores {
  economic: number;
  social: number;
  government: number;
  environment: number;
  foreign: number;
}

export interface QuizResult {
  axisScores: AxisScores;
  overallScore: number;
  orientationLabel: OrientationLabel;
  summary: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isProfilePublic: boolean;
  matchingOptIn: boolean;
  latestResult?: QuizResult;
  createdAt: string;
}

export interface Match {
  id: string;
  userA: UserProfile;
  userB: UserProfile;
  status: 'pending' | 'active' | 'declined_by_a' | 'declined_by_b' | 'blocked';
  avgScoreDiff: number;
  agreeingAxes: PolicyAxis[];
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  sentAt: string;
  isDeleted: boolean;
}

export interface QuizSubmission {
  answers: Record<string, number>; // questionKey -> 0-100
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
