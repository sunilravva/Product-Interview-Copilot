import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  FileText, 
  HelpCircle, 
  Volume2, 
  RotateCcw, 
  Star, 
  Edit3, 
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import { InterviewQuestion, InterviewMetadata } from '../types';

interface LiveInterviewStepProps {
  questions: InterviewQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<InterviewQuestion[]>>;
  activeQuestionIndex: number;
  setActiveQuestionIndex: (idx: number) => void;
  metadata: InterviewMetadata;
  onFinishInterview: () => void;
}

export const LiveInterviewStep: React.FC<LiveInterviewStepProps> = ({
  questions,
  setQuestions,
  activeQuestionIndex,
  setActiveQuestionIndex,
  metadata,
  onFinishInterview,
}) => {
  const activeQuestion = questions[activeQuestionIndex] || questions[0];

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [liveFeedback, setLiveFeedback] = useState<string | null>(null);
  const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }

      if (currentTranscript) {
        // Update candidate answer for current active question
        setQuestions((prev) =>
          prev.map((q, idx) => {
            if (idx === activeQuestionIndex) {
              const existingText = q.candidateAnswer ? q.candidateAnswer.trim() : '';
              // Avoid duplicate append if interim
              const updatedText = event.results[event.resultIndex].isFinal
                ? `${existingText} ${currentTranscript}`.trim()
                : `${existingText} [transcribing...] ${currentTranscript}`.trim();
              return { ...q, candidateAnswer: updatedText.replace(' [transcribing...]', '') };
            }
            return q;
          })
        );
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setSpeechSupported(false);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [activeQuestionIndex, setQuestions]);

  // Audio level simulation during recording
  useEffect(() => {
    let animInterval: any = null;
    if (isListening) {
      animInterval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 80) + 20);
      }, 150);
    } else {
      setAudioLevel(0);
    }
    return () => {
      if (animInterval) clearInterval(animInterval);
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleScoreChange = (scoreVal: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeQuestionIndex ? { ...q, score: scoreVal } : q))
    );
  };

  const handleNotesChange = (notesText: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeQuestionIndex ? { ...q, interviewerNotes: notesText } : q))
    );
  };

  const handleAnswerTextChange = (answerText: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeQuestionIndex ? { ...q, candidateAnswer: answerText } : q))
    );
  };

  const handleAnalyzeLiveAnswer = async () => {
    if (!activeQuestion.candidateAnswer || activeQuestion.candidateAnswer.trim().length < 10) return;

    setIsAnalyzingLive(true);
    try {
      const res = await fetch('/api/interview/live-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion.question,
          criteria: activeQuestion.evaluationCriteria,
          candidateAnswer: activeQuestion.candidateAnswer,
          targetLevel: metadata.experienceLevel,
        }),
      });
      const data = await res.json();
      setLiveFeedback(data.feedback || 'Answer recorded.');
    } catch (err) {
      setLiveFeedback('Live analysis currently unavailable.');
    } finally {
      setIsAnalyzingLive(false);
    }
  };

  const handleInsertSampleAnswer = () => {
    const sampleAnswers: Record<string, string> = {
      strategy:
        'To approach this strategic problem for Google Maps, I would first break down the primary user segments: daily commuters vs local explorers. For local discovery, the core problem is trust and hyper-curated contextual recommendations. I would leverage Google Places data to introduce personalized "Neighborhood Playlists" curated by verified local guides. We would measure success through D30 local place saves and merchant interaction conversion rates.',
      delivery:
        'Faced with a 4-week delivery bottleneck 2 weeks before launch, my immediate priority is triage. I would convene a joint session with the Tech Lead and UX designer to split the release into Phase 1 MVP and Phase 2 enhancement. We can temporarily gate advanced filtering while shipping the core workflow safely. I would communicate this proactively to key enterprise sponsors with updated risk milestones.',
      metrics:
        'To diagnose the 18% onboarding drop, I would isolate internal build changes vs external factors. I would analyze the telemetry by device, browser, and marketing acquisition channel. If the drop coincides with the new MFA security step, I would recommend optimizing the verification SMS code flow to auto-fill or fallback to email to restore conversion.',
    };

    const topicKey = activeQuestion.topicId;
    const answerToInsert =
      sampleAnswers[topicKey] ||
      'In my previous role leading product at scale, I addressed this challenge by aligning stakeholders around OKRs, conducting 20+ user interviews, and establishing clear A/B testing criteria before rollout.';

    handleAnswerTextChange(answerToInsert);
  };

  if (!activeQuestion) return null;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Banner: Voice Status Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Left: Candidate Badge & Audio Visualizer */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title={isListening ? 'Click to Pause Mic' : 'Click to Turn On Mic Capture'}
            >
              {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">
                {isListening ? 'Listening & Transcribing...' : 'Voice Auto-Capture Paused'}
              </span>
              {isListening && (
                <span className="text-[10px] bg-red-500/20 text-red-300 font-semibold px-2 py-0.5 rounded-full border border-red-500/30">
                  LIVE AUDIO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate speech will automatically transcribe under Question {activeQuestionIndex + 1}.
            </p>
          </div>
        </div>

        {/* Center Audio Signal Pulse */}
        {isListening && (
          <div className="hidden sm:flex items-center space-x-1 h-6 px-4 bg-slate-800/80 rounded-xl border border-slate-700">
            {[40, 70, 30, 90, 60, 100, 50, 80, 40].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-400 rounded-full transition-all duration-150"
                style={{ height: `${Math.max(10, (h * audioLevel) / 100)}%` }}
              />
            ))}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {!speechSupported && (
            <span className="text-xs text-amber-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Speech API not supported in browser; manual typing enabled</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleInsertSampleAnswer}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Insert Sample Answer
          </button>

          <button
            type="button"
            onClick={onFinishInterview}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
          >
            <Award className="w-4 h-4" />
            <span>Complete & Synthesize Decision</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Question Navigator Sidebar + Active Question Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Question Navigation List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Question Navigator ({questions.length})
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              {questions.filter((q) => q.score > 0 || q.candidateAnswer.trim()).length}/{questions.length} done
            </span>
          </div>

          <div className="space-y-1.5">
            {questions.map((q, idx) => {
              const isActive = idx === activeQuestionIndex;
              const isAnswered = q.candidateAnswer.trim().length > 0;
              const hasScore = q.score > 0;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between space-x-2 ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {hasScore ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isAnswered ? (
                        <Circle className="w-4 h-4 text-amber-500 fill-amber-100" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs truncate font-bold text-slate-900">
                        Q{idx + 1}: {q.topicName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  {hasScore && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      {q.score}/5
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Area: Active Question Card & Answer Recorder */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-lg">
                  Question {activeQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  {activeQuestion.topicName}
                </span>
                {activeQuestion.isResumeDerived && (
                  <span className="text-xs font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Resume Tailored</span>
                  </span>
                )}
              </div>

              {/* Prev / Next Question controls */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={activeQuestionIndex === 0}
                  onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                  title="Previous Question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={activeQuestionIndex === questions.length - 1}
                  onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-700"
                  title="Next Question"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {activeQuestion.question}
            </h2>

            {/* Resume Origin Note */}
            {activeQuestion.isResumeDerived && activeQuestion.resumeContext && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-xs text-purple-950 font-medium">
                💡 <strong>Resume Context:</strong> {activeQuestion.resumeContext}
              </div>
            )}

            {/* Evaluation Guidelines & Probing Follow-ups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Evaluation Rubric / Key Signals</span>
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  {activeQuestion.evaluationCriteria.map((crit, idx) => (
                    <li key={idx}>{crit}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Suggested Probing Follow-Ups</span>
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  {activeQuestion.suggestedFollowUps.map((fol, idx) => (
                    <li key={idx}>{fol}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          {/* Captured Candidate Answer Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Captured Candidate Answer & Speech Transcript</span>
              </label>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400">
                  Words: {activeQuestion.candidateAnswer.trim() ? activeQuestion.candidateAnswer.trim().split(/\s+/).length : 0}
                </span>

                {activeQuestion.candidateAnswer && (
                  <button
                    type="button"
                    onClick={() => handleAnswerTextChange('')}
                    className="text-red-600 hover:text-red-700 font-medium text-[11px] flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={6}
              value={activeQuestion.candidateAnswer}
              onChange={(e) => handleAnswerTextChange(e.target.value)}
              placeholder={
                isListening
                  ? 'Speak into microphone... candidate response is being transcribed live here...'
                  : 'Type candidate answer or click microphone above to start live speech recognition...'
              }
              className="w-full p-4 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 font-sans focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed"
            />

            {/* AI Live Feedback Action */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={isAnalyzingLive || !activeQuestion.candidateAnswer.trim()}
                onClick={handleAnalyzeLiveAnswer}
                className="inline-flex items-center space-x-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isAnalyzingLive ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Analyzing Answer Coverage...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Check Answer Coverage & Signals</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Feedback Result Callout */}
            {liveFeedback && (
              <div className="p-3.5 rounded-xl bg-purple-900/90 text-purple-100 text-xs space-y-1 shadow-inner border border-purple-700">
                <div className="font-bold text-purple-200 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Real-time AI Feedback</span>
                </div>
                <p className="leading-relaxed">{liveFeedback}</p>
              </div>
            )}
          </div>

          {/* Rating & Interviewer Notes Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Score Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 md:col-span-1">
              <label className="text-xs font-bold text-slate-900 block">
                Question Performance Score (1-5)
              </label>

              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => {
                  const isSelected = activeQuestion.score === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleScoreChange(s)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 text-center font-medium">
                {activeQuestion.score === 1 && '1 - Unsatisfactory / Red Flag'}
                {activeQuestion.score === 2 && '2 - Below Expectations'}
                {activeQuestion.score === 3 && '3 - Meets Hiring Bar'}
                {activeQuestion.score === 4 && '4 - Strong Performance'}
                {activeQuestion.score === 5 && '5 - Exceptional / Bar Raiser'}
                {activeQuestion.score === 0 && 'Select a score rating'}
              </p>
            </div>

            {/* Interviewer Notes Scratchpad */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Interviewer Notes & Impressions</span>
              </label>

              <textarea
                rows={3}
                value={activeQuestion.interviewerNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Private interviewer notes (e.g. candidate used STAR framework, great structure on metric selection, weak on technical debt trade-offs)..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-sans focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
