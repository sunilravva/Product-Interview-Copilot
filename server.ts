import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Resume Parsing & Targeted Question Generation API
app.post('/api/resume/parse', async (req, res) => {
  try {
    const { resumeText, targetRole, experienceLevel, selectedTopics } = req.body;

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text.' });
    }

    const ai = getGeminiAI();
    const prompt = `
You are an expert Product Management Executive and Interviewer.
Analyze the following candidate resume for a ${experienceLevel || 'Product Manager'} role (${targetRole || 'Product Manager'}).
Selected interview focus topics: ${(selectedTopics || ['strategy', 'delivery', 'metrics']).join(', ')}.

Resume Text:
"""
${resumeText.slice(0, 8000)}
"""

Please parse this resume and extract key insights and generate 4 to 6 hyper-specific, custom interview questions derived directly from the candidate's actual projects, metrics, company experience, or tech stack mentioned in their resume.

Return JSON in this EXACT structure:
{
  "candidateName": "Extracted candidate name or Unknown Candidate",
  "currentRole": "Extracted current or recent title",
  "yearsOfExperience": "Estimated years of experience (e.g. 5+ years)",
  "keySkills": ["skill1", "skill2", "skill3"],
  "notableProjects": ["project or achievement 1", "project or achievement 2"],
  "domainExpertise": ["e.g. B2B SaaS, E-commerce, Mobile Apps"],
  "resumeDerivedQuestions": [
    {
      "topicId": "strategy | delivery | metrics | design | technical | leadership | prioritization",
      "topicName": "Matching topic title",
      "question": "Question directly referencing a specific project or metric on their resume...",
      "resumeContext": "Why this question was asked based on candidate's resume (e.g. 'You mentioned scaling active users from 10k to 100k at Acme Inc...')",
      "evaluationCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
      "suggestedFollowUps": ["Follow-up question 1", "Follow-up question 2"]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            currentRole: { type: Type.STRING },
            yearsOfExperience: { type: Type.STRING },
            keySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            notableProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
            domainExpertise: { type: Type.ARRAY, items: { type: Type.STRING } },
            resumeDerivedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topicId: { type: Type.STRING },
                  topicName: { type: Type.STRING },
                  question: { type: Type.STRING },
                  resumeContext: { type: Type.STRING },
                  evaluationCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedFollowUps: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['topicId', 'topicName', 'question', 'resumeContext', 'evaluationCriteria', 'suggestedFollowUps'],
              },
            },
          },
          required: ['candidateName', 'keySkills', 'notableProjects', 'resumeDerivedQuestions'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({ success: true, parsedResume: parsedJson });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse resume with AI' });
  }
});

// 2. Custom Question Generator API
app.post('/api/questions/generate', async (req, res) => {
  try {
    const { experienceLevel, selectedTopics, companyName, jobDescription } = req.body;

    const ai = getGeminiAI();
    const prompt = `
Generate 1 high-yield, realistic Product Management interview question for EACH of the following topics: ${(selectedTopics || []).join(', ')}.
Candidate Target Experience Level: ${experienceLevel || 'Mid-Level Product Manager'}
Target Company Context: ${companyName || 'Technology Company'}
Optional Job Description Context: ${jobDescription || 'Standard Product Leader role'}

Return JSON in this format:
{
  "questions": [
    {
      "topicId": "topic id",
      "topicName": "topic name",
      "question": "Clear, engaging PM scenario question",
      "evaluationCriteria": ["Point 1", "Point 2", "Point 3"],
      "suggestedFollowUps": ["Follow up 1", "Follow up 2"],
      "tags": ["Tag1", "Tag2"]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(response.text || '{"questions": []}');
    return res.json({ success: true, questions: parsedJson.questions || [] });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate questions' });
  }
});

// 3. Real-time Answer Feedback / Live Analysis Endpoint
app.post('/api/interview/live-feedback', async (req, res) => {
  try {
    const { question, criteria, candidateAnswer, targetLevel } = req.body;

    if (!candidateAnswer || candidateAnswer.trim().length < 10) {
      return res.json({ feedback: 'Answer captured. Waiting for further details...' });
    }

    const ai = getGeminiAI();
    const prompt = `
Analyze this live candidate answer for a Product Manager interview (${targetLevel || 'PM'}).
Question: "${question}"
Evaluation Rubric: ${(criteria || []).join('; ')}
Candidate Transcribed Answer: "${candidateAnswer}"

Provide a brief, 2-sentence feedback summary for the interviewer:
1. What key PM concepts or strong signals were demonstrated?
2. What missing gaps or follow-up questions should the interviewer ask right now?
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({ feedback: response.text || 'Answer recorded.' });
  } catch (error: any) {
    console.error('Live feedback error:', error);
    return res.json({ feedback: 'Answer captured.' });
  }
});

// 4. Final Interview Synthesis & Recommendation API
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { metadata, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No interview questions provided for evaluation.' });
    }

    const ai = getGeminiAI();
    const prompt = `
You are the Lead Product Hiring Bar Raiser at a top technology company.
Synthesize the complete candidate interview for ${metadata.candidateName || 'Candidate'} (${metadata.experienceLevel}, target role: ${metadata.candidateTargetRole}).

Interviewer: ${metadata.interviewerName} (${metadata.interviewerRole})
Company/Org: ${metadata.companyName}
Date: ${metadata.interviewDate}

Here are the questions asked, candidate transcripts, scores, and interviewer notes:
${JSON.stringify(
  questions.map((q: any) => ({
    topic: q.topicName,
    question: q.question,
    candidateAnswer: q.candidateAnswer || 'No answer recorded',
    interviewerScore: q.score > 0 ? `${q.score}/5` : 'Unrated',
    notes: q.interviewerNotes || 'None',
    isResumeDerived: q.isResumeDerived ? true : false,
  })),
  null,
  2
)}

Resume Context if available:
${metadata.parsedResume ? JSON.stringify(metadata.parsedResume.keySkills) : 'N/A'}

Analyze the candidate holistically across Product Strategy, Execution, Analytical Thinking, Communication, Technical Awareness, and Stakeholder Leadership.

Produce JSON matching this exact structure:
{
  "overallDecision": "Strong Hire" | "Hire" | "Lean Hire" | "Lean No Hire" | "No Hire",
  "overallScore": 4.2, // number between 1.0 and 5.0
  "competencyScores": [
    {
      "topicId": "strategy",
      "topicName": "Product Strategy & Vision",
      "score": 4.0, // number 1-5
      "summary": "Demonstrated strong strategic framework and market sizing awareness..."
    }
  ],
  "executiveSummary": "A 3-4 sentence high-level executive overview of candidate performance, strengths, and fit for the ${metadata.experienceLevel} level.",
  "keyStrengths": [
    "Strength 1 with specific evidence from answers",
    "Strength 2 with specific evidence",
    "Strength 3"
  ],
  "areasOfConcern": [
    "Area of growth or red flag 1",
    "Area 2"
  ],
  "hiringRecommendation": "Clear recommendation on candidate level fit, team placement, or areas to probe in future rounds.",
  "recruiterEmailBody": "A complete, beautifully formatted Markdown email feedback summary ready to send to Recruiter and Hiring Manager."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedEvaluation = JSON.parse(response.text || '{}');
    parsedEvaluation.evaluatedAt = new Date().toISOString();

    return res.json({ success: true, evaluation: parsedEvaluation });
  } catch (error: any) {
    console.error('Error synthesizing interview evaluation:', error);
    return res.status(500).json({ error: error.message || 'Failed to synthesize interview evaluation.' });
  }
});

// 5. Send Email API Endpoint
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, body, metadata } = req.body;

    console.log(`[Email Service] Simulating email dispatch to: ${to}`);
    console.log(`Subject: ${subject}`);

    return res.json({
      success: true,
      message: `Feedback report sent successfully to ${to}`,
      timestamp: new Date().toISOString(),
      details: {
        to,
        subject,
        sentBy: metadata?.interviewerName || 'Interviewer',
        candidateName: metadata?.candidateName || 'Candidate',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Product Interview Copilot server running on http://localhost:${PORT}`);
  });
}

startServer();
