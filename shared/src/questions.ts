import { Question, QuizSection } from './types';

export const QUESTIONS: Question[] = [
  // Economic Policy
  {
    key: 'economic_tax',
    axis: 'economic',
    labelLeft: 'Higher taxes on top earners to fund public services',
    labelRight: 'Lower, flatter taxes to let individuals keep more of what they earn',
  },
  {
    key: 'economic_healthcare',
    axis: 'economic',
    labelLeft: 'Universal public healthcare is a government responsibility',
    labelRight: 'Market-driven healthcare gives people more choice and efficiency',
  },
  {
    key: 'economic_trade',
    axis: 'economic',
    labelLeft: 'Protect domestic industries with tariffs and restrictions',
    labelRight: 'Free trade benefits everyone through open global markets',
  },

  // Social Issues
  {
    key: 'social_immigration',
    axis: 'social',
    labelLeft: 'Welcome more immigrants; open borders benefit society',
    labelRight: 'Strict immigration controls protect jobs and national identity',
  },
  {
    key: 'social_guns',
    axis: 'social',
    labelLeft: 'Stronger gun regulations reduce violence and save lives',
    labelRight: 'The right to bear arms is fundamental and must be protected',
  },
  {
    key: 'social_drugs',
    axis: 'social',
    labelLeft: 'Decriminalize or legalize drugs; treat addiction as a health issue',
    labelRight: 'Strong drug enforcement protects communities and public safety',
  },

  // Role of Government
  {
    key: 'government_size',
    axis: 'government',
    labelLeft: 'A larger government can better provide safety nets and services',
    labelRight: 'A smaller government means more individual freedom and efficiency',
  },
  {
    key: 'government_federal',
    axis: 'government',
    labelLeft: 'Federal standards ensure equal rights and consistency nationwide',
    labelRight: 'States should have more autonomy to govern themselves',
  },
  {
    key: 'government_privacy',
    axis: 'government',
    labelLeft: 'Personal privacy must be protected from government overreach',
    labelRight: 'National security sometimes requires surveillance tradeoffs',
  },

  // Environment & Energy
  {
    key: 'environment_climate',
    axis: 'environment',
    labelLeft: 'Urgent, sweeping government action is needed to address climate change',
    labelRight: 'Market solutions and gradual change are more practical and less costly',
  },
  {
    key: 'environment_energy',
    axis: 'environment',
    labelLeft: 'Rapidly transition away from fossil fuels to renewables',
    labelRight: 'Fossil fuels remain essential; transition should be slow and balanced',
  },

  // Foreign Policy
  {
    key: 'foreign_military',
    axis: 'foreign',
    labelLeft: 'Reduce military spending; invest in diplomacy and domestic needs',
    labelRight: 'Strong defense spending protects national security and global stability',
  },
  {
    key: 'foreign_intervention',
    axis: 'foreign',
    labelLeft: 'Stay out of foreign conflicts; prioritize domestic affairs',
    labelRight: 'The U.S. should actively engage globally to promote democracy and stability',
  },
];

export const QUIZ_SECTIONS: QuizSection[] = [
  {
    axis: 'economic',
    title: 'Economic Policy',
    questions: QUESTIONS.filter((q) => q.axis === 'economic'),
  },
  {
    axis: 'social',
    title: 'Social Issues',
    questions: QUESTIONS.filter((q) => q.axis === 'social'),
  },
  {
    axis: 'government',
    title: 'Role of Government',
    questions: QUESTIONS.filter((q) => q.axis === 'government'),
  },
  {
    axis: 'environment',
    title: 'Environment & Energy',
    questions: QUESTIONS.filter((q) => q.axis === 'environment'),
  },
  {
    axis: 'foreign',
    title: 'Foreign Policy',
    questions: QUESTIONS.filter((q) => q.axis === 'foreign'),
  },
];

export const AXIS_TITLES: Record<string, string> = {
  economic: 'Economic Policy',
  social: 'Social Issues',
  government: 'Role of Government',
  environment: 'Environment & Energy',
  foreign: 'Foreign Policy',
};
