import React, { useState } from 'react';
import { 
  Award, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BarChart3, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Loader2,
  RefreshCw,
  UserCheck,
  Building
} from 'lucide-react';
import { InterviewEvaluation, InterviewMetadata, InterviewQuestion } from '../types';

interface EvaluationStepProps {
  evaluation: InterviewEvaluation | null;
  metadata: InterviewMetadata;
  questions: InterviewQuestion[];
  isSynthesizing: boolean;
  onSynthesizeEvaluation: () => Promise<void>;
  onOpenEmailModal: () => void;
  onBackToInterview: () => void;
}

export const EvaluationStep: React.FC<EvaluationStepProps> = ({
  evaluation,
  metadata,
  questions,
  isSynthesizing,
  onSynthesizeEvaluation,
  onOpenEmailModal,
  onBackToInterview,
}) => {
  const [showTranscripts, setShowTranscripts] = useState(false);

  if (isSynthesizing) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Synthesizing Final Interview Decision...
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Gemini AI is analyzing candidate speech transcripts, per-question ratings, competency benchmarks, and resume fit to produce the final hiring recommendation.
        </p>
        <div className="flex items-center justify-center space-x-2 text-indigo-600 pt-2 font-semibold text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Evaluating Product Competencies...</span>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Award className="w-12 h-12 text-indigo-600 mx-auto" />
        <div>
          <h2 className="text-xl font-bold text-slate-900">No Evaluation Synthesized Yet</h2>
          <p className="text-xs text-slate-500 mt-1">
            Click below to compile candidate scores and generate the complete hiring decision report.
          </p>
        </div>
        <button
          type="button"
          onClick={onSynthesizeEvaluation}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md text-sm inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Synthesize Candidate Decision</span>
        </button>
      </div>
    );
  }

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'Strong Hire':
        return 'bg-emerald-600 text-white border-emerald-500 shadow-lg';
      case 'Hire':
        return 'bg-emerald-500 text-white border-emerald-400 shadow-md';
      case 'Lean Hire':
        return 'bg-blue-600 text-white border-blue-500 shadow-sm';
      case 'Lean No Hire':
        return 'bg-amber-500 text-white border-amber-400 shadow-sm';
      case 'No Hire':
        return 'bg-red-600 text-white border-red-500 shadow-md';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Final Decision Report
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-600">{metadata.interviewDate}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {metadata.candidateName} — Interview Summary
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Role: <strong className="text-slate-800">{metadata.candidateTargetRole}</strong> ({metadata.experienceLevel}) | Interviewer: <strong className="text-slate-800">{metadata.interviewerName}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onSynthesizeEvaluation}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Re-Synthesize</span>
          </button>

          <button
            type="button"
            onClick={onOpenEmailModal}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email Summary</span>
          </button>
        </div>
      </div>

      {/* Decision Banner Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <span className={`text-base sm:text-lg font-extrabold px-4 py-1.5 rounded-2xl border ${getDecisionBadge(evaluation.overallDecision)}`}>
                RECOMMENDATION: {evaluation.overallDecision.toUpperCase()}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-100">
              Executive Evaluation Summary
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {evaluation.executiveSummary}
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Overall Candidate Score
            </span>
            <div className="text-4xl font-extrabold text-white">
              {evaluation.overallScore.toFixed(1)}{' '}
              <span className="text-lg font-normal text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Evaluated across {questions.length} structured PM dimensions
            </p>
          </div>

        </div>
      </div>

      {/* Competency Scores Breakdown Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Competency Benchmark Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluation.competencyScores.map((comp, idx) => {
            const scorePct = (comp.score / 5) * 100;
            return (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{comp.topicName}</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {comp.score.toFixed(1)} / 5.0
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      comp.score >= 4
                        ? 'bg-emerald-500'
                        : comp.score >= 3
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${scorePct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 leading-normal">
                  {comp.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Red Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Strengths */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-950 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Demonstrations & Strengths</span>
          </h3>
          <ul className="space-y-2 text-xs text-emerald-900 list-disc list-inside">
            {evaluation.keyStrengths.map((s, idx) => (
              <li key={idx} className="leading-relaxed">{s}</li>
            ))}
          </ul>
        </div>

        {/* Areas of Growth / Red Flags */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-amber-950 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Areas of Concern & Growth Gaps</span>
          </h3>
          <ul className="space-y-2 text-xs text-amber-900 list-disc list-inside">
            {evaluation.areasOfConcern.map((a, idx) => (
              <li key={idx} className="leading-relaxed">{a}</li>
            ))}
          </ul>
        </div>

      </div>

      {/* Full Question-by-Question Transcripts Drawer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <button
          type="button"
          onClick={() => setShowTranscripts(!showTranscripts)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-900 text-left"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Review Full Question Transcripts & Interviewer Notes ({questions.length})</span>
          </div>
          {showTranscripts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTranscripts && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-indigo-900">Q{idx + 1}: {q.question}</span>
                  <span className="text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Score: {q.score > 0 ? `${q.score}/5` : 'Unrated'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  <strong>Candidate Answer:</strong> {q.candidateAnswer || 'No transcript recorded.'}
                </div>
                {q.interviewerNotes && (
                  <div className="text-slate-600 italic">
                    <strong>Interviewer Notes:</strong> {q.interviewerNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToInterview}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Interview</span>
        </button>

        <button
          type="button"
          onClick={onOpenEmailModal}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-xl shadow-lg transition-colors text-sm"
        >
          <Send className="w-4 h-4" />
          <span>Compose & Send Email Report</span>
        </button>
      </div>

    </div>
  );
};
