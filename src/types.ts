export type ExperienceLevel = 
  | 'Associate / Junior PM'
  | 'Mid-Level Product Manager'
  | 'Senior Product Manager'
  | 'Lead / Staff Product Manager'
  | 'Director / Head of Product';

export type TopicCategory = 
  | 'strategy'
  | 'delivery'
  | 'metrics'
  | 'design'
  | 'technical'
  | 'leadership'
  | 'prioritization';

export interface TopicInfo {
  id: TopicCategory;
  name: string;
  description: string;
  iconName: string;
}

export interface InterviewQuestion {
  id: string;
  topicId: TopicCategory;
  topicName: string;
  question: string;
  isResumeDerived?: boolean;
  resumeContext?: string;
  evaluationCriteria: string[];
  suggestedFollowUps: string[];
  candidateAnswer: string;
  score: number; // 0 = unrated, 1-5 scale
  interviewerNotes: string;
  aiQuickFeedback?: string;
  tags?: string[];
}

export interface ParsedResumeInfo {
  candidateName?: string;
  currentRole?: string;
  yearsOfExperience?: string;
  keySkills: string[];
  notableProjects: string[];
  domainExpertise: string[];
  resumeDerivedQuestions: Array<{
    topicId: TopicCategory;
    topicName: string;
    question: string;
    resumeContext: string;
    evaluationCriteria: string[];
    suggestedFollowUps: string[];
  }>;
}

export interface InterviewMetadata {
  interviewerName: string;
  interviewerRole: string;
  candidateName: string;
  candidateTargetRole: string;
  experienceLevel: ExperienceLevel;
  companyName: string;
  interviewDate: string;
  selectedTopics: TopicCategory[];
  resumeText: string;
  parsedResume?: ParsedResumeInfo;
}

export type DecisionType = 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Lean No Hire' | 'No Hire';

export interface CompetencyScore {
  topicId: TopicCategory;
  topicName: string;
  score: number; // 1-5 or 0-100%
  summary: string;
}

export interface InterviewEvaluation {
  overallDecision: DecisionType;
  overallScore: number; // e.g. 4.2 / 5
  competencyScores: CompetencyScore[];
  executiveSummary: string;
  keyStrengths: string[];
  areasOfConcern: string[];
  hiringRecommendation: string;
  recruiterEmailBody: string;
  evaluatedAt: string;
}
