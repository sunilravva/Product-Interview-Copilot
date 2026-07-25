import { InterviewQuestion, TopicCategory, TopicInfo } from '../types';

export const TOPIC_DEFINITIONS: TopicInfo[] = [
  {
    id: 'strategy',
    name: 'Product Strategy & Vision',
    description: 'Market analysis, business models, competitive positioning, and vision alignment.',
    iconName: 'Compass',
  },
  {
    id: 'delivery',
    name: 'Execution & Delivery',
    description: 'Sprint planning, roadmap execution, cross-functional execution, and launch risk management.',
    iconName: 'Rocket',
  },
  {
    id: 'metrics',
    name: 'Analytics & Product Metrics',
    description: 'KPI selection, A/B testing, cohort retention, funnel analysis, and data-driven decisions.',
    iconName: 'BarChart3',
  },
  {
    id: 'design',
    name: 'Product Design & User Centricity',
    description: 'User research, empathy, UX problem solving, wireframing, and customer interview techniques.',
    iconName: 'Layout',
  },
  {
    id: 'technical',
    name: 'Technical Architecture & System Design',
    description: 'API trade-offs, scalability, working with engineering, tech debt, and system boundaries.',
    iconName: 'Cpu',
  },
  {
    id: 'prioritization',
    name: 'Prioritization & Roadmapping',
    description: 'RICE/Kano frameworks, trade-off management, feature cutbacks, and resource allocation.',
    iconName: 'Sliders',
  },
  {
    id: 'leadership',
    name: 'Leadership & Stakeholder Management',
    description: 'Managing conflict, alignment with executives, cross-functional influence without authority.',
    iconName: 'Users',
  },
];

export const DEFAULT_QUESTION_BANK: Record<TopicCategory, Array<Omit<InterviewQuestion, 'id' | 'candidateAnswer' | 'score' | 'interviewerNotes'>>> = {
  strategy: [
    {
      topicId: 'strategy',
      topicName: 'Product Strategy & Vision',
      question: 'Imagine you are PM for Google Maps. How would you design a strategy to compete against niche hyper-local discovery apps?',
      evaluationCriteria: [
        'Structured breakdown of target user segments',
        'Clear value proposition vs competitors',
        'Understanding of Google Maps platform network effects',
        'Measurement of strategy success (engagement vs business impact)',
      ],
      suggestedFollowUps: [
        'What core trade-offs are you making in prioritizing local discovery over navigation speed?',
        'How would you monetize or prove ROI for this strategic shift?',
      ],
      tags: ['Strategy', 'Competitive Analysis', 'CIRCLES'],
    },
    {
      topicId: 'strategy',
      topicName: 'Product Strategy & Vision',
      question: 'How do you evaluate whether our product should build a new feature in-house, acquire a small player, or partner via API integration?',
      evaluationCriteria: [
        'Build vs Buy vs Partner strategic framework',
        'Time-to-market and core competency evaluation',
        'Long-term total cost of ownership and security considerations',
      ],
      suggestedFollowUps: [
        'Can you share a real example from your past where you chose to partner over building?',
      ],
      tags: ['Build vs Buy', 'Strategy', 'B2B/SaaS'],
    }
  ],
  delivery: [
    {
      topicId: 'delivery',
      topicName: 'Execution & Delivery',
      question: 'Your core feature launch is 2 weeks away, but engineering reports a major performance bottleneck that delays delivery by 4 weeks. How do you handle this?',
      evaluationCriteria: [
        'Risk triage and scope reduction strategy (MVP cutbacks)',
        'Transparent stakeholder communication',
        'Unblocking engineers without compromising quality or safety',
      ],
      suggestedFollowUps: [
        'How do you communicate this delay to senior executives and customers?',
        'What guardrails would you put in place to prevent this in future sprints?',
      ],
      tags: ['Delivery', 'Agile', 'Crisis Management'],
    },
    {
      topicId: 'delivery',
      topicName: 'Execution & Delivery',
      question: 'Describe how you work with engineering teams during sprint planning to balance new feature velocity with technical debt reduction.',
      evaluationCriteria: [
        'Process for technical debt allocation (e.g., 20% rule or dedicated hardening sprints)',
        'Mutual trust and joint ownership with Tech Lead / Engineering Manager',
        'Clear criteria for acceptance and definition of done',
      ],
      suggestedFollowUps: [
        'How do you explain technical debt cleanup value to non-technical business leaders?',
      ],
      tags: ['Sprint Planning', 'Tech Debt', 'Agile'],
    }
  ],
  metrics: [
    {
      topicId: 'metrics',
      topicName: 'Analytics & Product Metrics',
      question: 'You notice that user retention on our onboarding flow dropped by 18% over the last week. How would you diagnose and investigate this metric drop?',
      evaluationCriteria: [
        'Structured root cause analysis framework (internal changes vs external factors)',
        'Funnel segment breakdown (device, geography, user cohort, browser)',
        'Collaboration with data analytics, QA, and UX teams',
      ],
      suggestedFollowUps: [
        'If it turns out to be a design change that improved conversion but dropped D30 retention, what is your recommendation?',
      ],
      tags: ['Metrics', 'Root Cause', 'Retention'],
    },
    {
      topicId: 'metrics',
      topicName: 'Analytics & Product Metrics',
      question: 'Define the North Star Metric for Spotify or Netflix and list 3 guardrail metrics you would track alongside it.',
      evaluationCriteria: [
        'Deep understanding of value exchange (consumption vs user value vs revenue)',
        'Identification of primary vs secondary input metrics',
        'Awareness of vanity metrics vs actionable retention metrics',
      ],
      suggestedFollowUps: [
        'How would you prevent local optimization of the North Star at the expense of long-term churn?',
      ],
      tags: ['North Star Metric', 'AARRR', 'Analytics'],
    }
  ],
  design: [
    {
      topicId: 'design',
      topicName: 'Product Design & User Centricity',
      question: 'How would you redesign the airport security check-in experience for families traveling with young children?',
      evaluationCriteria: [
        'User empathy and persona mapping (parent anxiety, toddler dynamics)',
        'Pain point prioritization and physical vs digital touchpoints',
        'Creative yet realistic MVP solution generation',
      ],
      suggestedFollowUps: [
        'How would you prototype and test this without building a physical airport setup?',
      ],
      tags: ['Product Design', 'Empathy', 'UX'],
    }
  ],
  technical: [
    {
      topicId: 'technical',
      topicName: 'Technical Architecture & System Design',
      question: 'How do you explain REST APIs, WebSockets, and Webhooks to a non-technical product stakeholder, and when would you choose WebSockets over REST?',
      evaluationCriteria: [
        'Clarity of simple analogies without confusing technical jargon',
        'Understanding real-time latency needs (e.g., live chat, collaborative editing vs polling)',
        'Trade-offs in server resources and state management',
      ],
      suggestedFollowUps: [
        'How do latency considerations impact user experience metrics?',
      ],
      tags: ['Technical Depth', 'APIs', 'Real-time'],
    }
  ],
  prioritization: [
    {
      topicId: 'prioritization',
      topicName: 'Prioritization & Roadmapping',
      question: 'You have 5 high-priority feature requests: 2 from enterprise sales, 1 from customer support, 1 from engineering, and 1 design polish. How do you prioritize them?',
      evaluationCriteria: [
        'Prioritization framework usage (RICE, Impact vs Effort, Value Matrix)',
        'Alignment with strategic quarterly OKRs',
        'Ability to say "No" with data and empathy',
      ],
      suggestedFollowUps: [
        'How do you manage the relationship with the enterprise sales VP whose feature was deprioritized?',
      ],
      tags: ['Prioritization', 'RICE', 'Stakeholders'],
    }
  ],
  leadership: [
    {
      topicId: 'leadership',
      topicName: 'Leadership & Stakeholder Management',
      question: 'Tell me about a time when your Lead Engineer and Senior Designer had a fundamental disagreement about a key product interaction. How did you resolve it?',
      evaluationCriteria: [
        'Conflict resolution and facilitation skills',
        'Data-driven grounding (user testing, telemetry) vs opinion-based debate',
        'Maintaining team morale and psychological safety',
      ],
      suggestedFollowUps: [
        'What would you do if user research results were inconclusive?',
      ],
      tags: ['Leadership', 'Conflict Resolution', 'Cross-Functional'],
    }
  ]
};
