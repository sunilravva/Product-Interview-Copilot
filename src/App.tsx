import React, { useState } from 'react';
import { Header } from './components/Header';
import { SetupStep } from './components/SetupStep';
import { QuestionPlanStep } from './components/QuestionPlanStep';
import { LiveInterviewStep } from './components/LiveInterviewStep';
import { EvaluationStep } from './components/EvaluationStep';
import { SendEmailModal } from './components/SendEmailModal';
import { InterviewMetadata, InterviewQuestion, InterviewEvaluation, TopicCategory } from './types';
import { DEFAULT_QUESTION_BANK } from './data/questionBank';

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const [metadata, setMetadata] = useState<InterviewMetadata>({
    interviewerName: 'Sunil Ravva',
    interviewerRole: 'Lead Product Manager',
    candidateName: 'Alex Chen',
    candidateTargetRole: 'Senior Product Manager',
    experienceLevel: 'Senior Product Manager',
    companyName: 'Google AI Studio',
    interviewDate: new Date().toISOString().split('T')[0],
    selectedTopics: ['strategy', 'delivery', 'metrics', 'prioritization'],
    resumeText: '',
  });

  // Initialize questions from default question bank based on selected topics
  const initialQuestions: InterviewQuestion[] = metadata.selectedTopics.flatMap((topicId) => {
    const list = DEFAULT_QUESTION_BANK[topicId] || [];
    return list.map((item, idx) => ({
      ...item,
      id: `${topicId}_${idx}_${Date.now()}`,
      candidateAnswer: '',
      score: 0,
      interviewerNotes: '',
    }));
  });

  const [questions, setQuestions] = useState<InterviewQuestion[]>(initialQuestions);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Resume Parse Handler
  const handleParseResume = async (resumeContent: string) => {
    if (!resumeContent.trim()) return;
    setIsParsingResume(true);

    try {
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeContent,
          targetRole: metadata.candidateTargetRole,
          experienceLevel: metadata.experienceLevel,
          selectedTopics: metadata.selectedTopics,
        }),
      });

      const data = await res.json();
      if (data.success && data.parsedResume) {
        const parsed = data.parsedResume;

        // Auto-update candidate name if extracted
        const updatedMetadata = { ...metadata, parsedResume: parsed };
        if (parsed.candidateName && parsed.candidateName !== 'Unknown Candidate') {
          updatedMetadata.candidateName = parsed.candidateName;
        }
        setMetadata(updatedMetadata);

        // Convert resume-derived questions to InterviewQuestion format
        if (parsed.resumeDerivedQuestions?.length > 0) {
          const newResumeQuestions: InterviewQuestion[] = parsed.resumeDerivedQuestions.map(
            (rq: any, idx: number) => ({
              id: `resume_derived_${idx}_${Date.now()}`,
              topicId: (rq.topicId as TopicCategory) || 'strategy',
              topicName: rq.topicName || 'Resume Background',
              question: rq.question,
              isResumeDerived: true,
              resumeContext: rq.resumeContext,
              evaluationCriteria: rq.evaluationCriteria || [],
              suggestedFollowUps: rq.suggestedFollowUps || [],
              candidateAnswer: '',
              score: 0,
              interviewerNotes: '',
              tags: ['Resume Derived'],
            })
          );

          // Prepend resume derived questions to current question list
          setQuestions((prev) => [...newResumeQuestions, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to parse resume:', err);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Generate More AI Questions Handler
  const handleGenerateMoreQuestions = async () => {
    setIsGeneratingMore(true);
    try {
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceLevel: metadata.experienceLevel,
          selectedTopics: metadata.selectedTopics,
          companyName: metadata.companyName,
        }),
      });

      const data = await res.json();
      if (data.success && data.questions) {
        const generatedList: InterviewQuestion[] = data.questions.map((q: any, idx: number) => ({
          id: `ai_gen_${idx}_${Date.now()}`,
          topicId: (q.topicId as TopicCategory) || 'strategy',
          topicName: q.topicName || 'Product Scenario',
          question: q.question,
          evaluationCriteria: q.evaluationCriteria || [],
          suggestedFollowUps: q.suggestedFollowUps || [],
          candidateAnswer: '',
          score: 0,
          interviewerNotes: '',
          tags: q.tags || ['AI Generated'],
        }));

        setQuestions((prev) => [...prev, ...generatedList]);
      }
    } catch (err) {
      console.error('Failed to generate extra questions:', err);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  // Synthesize Interview Evaluation Handler
  const handleSynthesizeEvaluation = async () => {
    setIsSynthesizing(true);
    setStep(4);

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata,
          questions,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (err) {
      console.error('Failed to synthesize evaluation:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const answeredCount = questions.filter((q) => q.score > 0 || q.candidateAnswer.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Header Bar */}
      <Header
        currentStep={step}
        setStep={(newStep) => {
          if (newStep === 4 && !evaluation) {
            handleSynthesizeEvaluation();
          } else if (newStep === 5) {
            if (!evaluation) {
              handleSynthesizeEvaluation().then(() => setIsEmailModalOpen(true));
            } else {
              setIsEmailModalOpen(true);
            }
          } else {
            setStep(newStep);
          }
        }}
        metadata={metadata}
        totalQuestions={questions.length}
        answeredQuestions={answeredCount}
        isInterviewActive={step === 3}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {step === 1 && (
          <SetupStep
            metadata={metadata}
            setMetadata={setMetadata}
            onContinue={() => setStep(2)}
            onParseResume={handleParseResume}
            isParsingResume={isParsingResume}
          />
        )}

        {step === 2 && (
          <QuestionPlanStep
            questions={questions}
            setQuestions={setQuestions}
            onBack={() => setStep(1)}
            onStartInterview={() => {
              setActiveQuestionIndex(0);
              setStep(3);
            }}
            onGenerateMoreQuestions={handleGenerateMoreQuestions}
            isGeneratingMore={isGeneratingMore}
          />
        )}

        {step === 3 && (
          <LiveInterviewStep
            questions={questions}
            setQuestions={setQuestions}
            activeQuestionIndex={activeQuestionIndex}
            setActiveQuestionIndex={setActiveQuestionIndex}
            metadata={metadata}
            onFinishInterview={handleSynthesizeEvaluation}
          />
        )}

        {(step === 4 || step === 5) && (
          <EvaluationStep
            evaluation={evaluation}
            metadata={metadata}
            questions={questions}
            isSynthesizing={isSynthesizing}
            onSynthesizeEvaluation={handleSynthesizeEvaluation}
            onOpenEmailModal={() => setIsEmailModalOpen(true)}
            onBackToInterview={() => setStep(3)}
          />
        )}
      </main>

      {/* Email Dispatch Modal */}
      {evaluation && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          evaluation={evaluation}
          metadata={metadata}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Product Interview Copilot • AI Studio Workspace</p>
          <div className="flex items-center space-x-4">
            <span>Powered by Gemini 3.6 Flash</span>
            <span>•</span>
            <span>Web Speech API Audio Capture</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
