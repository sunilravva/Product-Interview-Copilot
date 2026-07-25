import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Tag, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { InterviewQuestion, TopicCategory } from '../types';
import { TOPIC_DEFINITIONS } from '../data/questionBank';

interface QuestionPlanStepProps {
  questions: InterviewQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<InterviewQuestion[]>>;
  onBack: () => void;
  onStartInterview: () => void;
  onGenerateMoreQuestions: () => Promise<void>;
  isGeneratingMore: boolean;
}

export const QuestionPlanStep: React.FC<QuestionPlanStepProps> = ({
  questions,
  setQuestions,
  onBack,
  onStartInterview,
  onGenerateMoreQuestions,
  isGeneratingMore,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicId, setNewTopicId] = useState<TopicCategory>('strategy');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCriteriaText, setNewCriteriaText] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const topicObj = TOPIC_DEFINITIONS.find((t) => t.id === newTopicId);

    const newQ: InterviewQuestion = {
      id: `custom_${Date.now()}`,
      topicId: newTopicId,
      topicName: topicObj?.name || 'Custom Topic',
      question: newQuestionText.trim(),
      evaluationCriteria: newCriteriaText.trim()
        ? newCriteriaText.split('\n').filter(Boolean)
        : ['Structured problem solving', 'Clarity of metrics and trade-offs'],
      suggestedFollowUps: ['What alternatives did you consider?'],
      candidateAnswer: '',
      score: 0,
      interviewerNotes: '',
      tags: ['Custom Question'],
    };

    setQuestions((prev) => [...prev, newQ]);
    setNewQuestionText('');
    setNewCriteriaText('');
    setShowAddModal(false);
  };

  const resumeCount = questions.filter((q) => q.isResumeDerived).length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Title & Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Question Plan
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Review, edit, or customize questions before launching the live candidate interview session.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-slate-700">
            Total Questions: <span className="text-indigo-600 font-bold">{questions.length}</span>
          </div>
          {resumeCount > 0 && (
            <div className="bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-purple-800 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{resumeCount} Resume-Derived</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Need more questions or customized scenarios?</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            disabled={isGeneratingMore}
            onClick={onGenerateMoreQuestions}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMore ? 'animate-spin' : ''}`} />
            <span>AI Suggest Additional Questions</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Question</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No questions in plan yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add custom questions or click AI Suggest to auto-generate questions for selected topics.
            </p>
            <button
              type="button"
              onClick={onGenerateMoreQuestions}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Generate AI Questions
            </button>
          </div>
        ) : (
          questions.map((q, idx) => {
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm ${
                  q.isResumeDerived
                    ? 'border-purple-300 bg-gradient-to-r from-purple-50/40 via-white to-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-5 flex items-start justify-between gap-4">
                  
                  <div className="flex items-start space-x-3.5">
                    {/* Index Badge */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      q.isResumeDerived
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-900 text-white'
                    }`}>
                      Q{idx + 1}
                    </div>

                    <div className="space-y-1.5">
                      
                      {/* Topic & Tags Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                          {q.topicName}
                        </span>

                        {q.isResumeDerived && (
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Resume Tailored</span>
                          </span>
                        )}

                        {q.tags?.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {q.question}
                      </p>

                      {/* Resume Context Callout */}
                      {q.isResumeDerived && q.resumeContext && (
                        <p className="text-xs text-purple-900 bg-purple-100/60 p-2.5 rounded-lg border border-purple-200/80 font-medium italic">
                          💡 <strong className="not-italic text-purple-950 font-bold">Resume Link:</strong> {q.resumeContext}
                        </p>
                      )}

                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(q.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Toggle Rubric & Follow-ups"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Expanded Rubric & Follow-ups */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/80 p-5 rounded-b-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Evaluation Rubric & Signals</span>
                      </h4>
                      <ul className="space-y-1 list-disc list-inside text-slate-600">
                        {q.evaluationCriteria.map((c, cIdx) => (
                          <li key={cIdx}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Suggested Probing Follow-Ups</span>
                      </h4>
                      <ul className="space-y-1 list-disc list-inside text-slate-600">
                        {q.suggestedFollowUps.map((f, fIdx) => (
                          <li key={fIdx}>{f}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Custom Interview Question</h3>
            
            <form onSubmit={handleAddCustomQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic Category</label>
                <select
                  value={newTopicId}
                  onChange={(e) => setNewTopicId(e.target.value as TopicCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                >
                  {TOPIC_DEFINITIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Text *</label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="e.g. How would you handle a disagreement between Engineering and Marketing regarding product release notes?"
                  className="w-full p-3 rounded-lg border border-slate-300 text-slate-900 font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evaluation Criteria (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={newCriteriaText}
                  onChange={(e) => setNewCriteriaText(e.target.value)}
                  placeholder="e.g. Stakeholder empathy&#10;Data-backed resolution&#10;Clear decision owner"
                  className="w-full p-3 rounded-lg border border-slate-300 text-slate-900 font-sans"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Setup</span>
        </button>

        <button
          type="button"
          disabled={questions.length === 0}
          onClick={onStartInterview}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-xl shadow-lg transition-all text-sm"
        >
          <span>Start Live Interview Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
