import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Calendar, 
  Briefcase, 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Tag,
  AlertCircle
} from 'lucide-react';
import { ExperienceLevel, InterviewMetadata, TopicCategory } from '../types';
import { TOPIC_DEFINITIONS } from '../data/questionBank';

interface SetupStepProps {
  metadata: InterviewMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<InterviewMetadata>>;
  onContinue: () => void;
  onParseResume: (text: string) => Promise<void>;
  isParsingResume: boolean;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Associate / Junior PM',
  'Mid-Level Product Manager',
  'Senior Product Manager',
  'Lead / Staff Product Manager',
  'Director / Head of Product',
];

export const SetupStep: React.FC<SetupStepProps> = ({
  metadata,
  setMetadata,
  onContinue,
  onParseResume,
  isParsingResume,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [fileError, setFileError] = useState<string | null>(null);

  const handleTopicToggle = (topicId: TopicCategory) => {
    setMetadata((prev) => {
      const exists = prev.selectedTopics.includes(topicId);
      const updated = exists
        ? prev.selectedTopics.filter((t) => t !== topicId)
        : [...prev.selectedTopics, topicId];
      return { ...prev, selectedTopics: updated };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setMetadata((prev) => ({
        ...prev,
        resumeText: content,
      }));
      await onParseResume(content);
    };
    reader.onerror = () => {
      setFileError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const sampleResumes = [
    {
      label: 'Senior PM Sample (B2B SaaS & Growth)',
      text: `ALEX CHEN - Senior Product Manager
      Summary: 6+ years leading product teams at Fintech and B2B SaaS startups. Managed core onboarding conversion and subscription billing features.
      Experience:
      - Senior PM at Stripe Solutions (2022-Present): Led cross-functional team of 8 engineers and 2 designers. Increased activation rate by 24% through redesigned onboarding funnel and self-serve team invites.
      - Product Manager at CloudFlow (2019-2022): Built automated billing dashboard and enterprise RBAC security permissions. Managed API migration from REST to GraphQL, reducing latency by 35%.
      Skills: Product Strategy, A/B Testing, SQL, Mixpanel, User Research, Roadmapping, Agile/Scrum.`,
    },
    {
      label: 'Technical Product Manager Sample (AI & Platform)',
      text: `SARAH JENKINS - Lead Technical Product Manager
      Summary: 8+ years experience building platform infrastructure, REST APIs, and AI integrations for enterprise developers.
      Experience:
      - Lead PM at DataMesh Inc (2021-Present): Owned vector search and LLM retrieval pipeline product roadmap. Scaled daily query throughput to 50M requests/day with 99.99% SLA.
      - Senior Technical PM at DevTools (2017-2021): Led microservices API redesign and developer portal documentation. Conducted 40+ customer interviews with CTOs and Lead Architects.
      Skills: System Design, Python, Microservices, API Strategy, Technical Architecture, OKRs, Stakeholders.`,
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Title & Introduction */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Candidate & Interview Setup
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Customize the interview scope, select core competency topics, and upload candidate resume to auto-generate resume-specific questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: General Metadata & Experience */}
        <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Interview Metadata</span>
          </h2>

          <div className="space-y-4 text-sm">
            
            {/* Interviewer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interviewer Name
              </label>
              <input
                type="text"
                value={metadata.interviewerName}
                onChange={(e) => setMetadata({ ...metadata, interviewerName: e.target.value })}
                placeholder="e.g. Sunil Ravva"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Candidate Name *
              </label>
              <input
                type="text"
                value={metadata.candidateName}
                onChange={(e) => setMetadata({ ...metadata, candidateName: e.target.value })}
                placeholder="e.g. Alex Chen"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Candidate Target Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={metadata.candidateTargetRole}
                onChange={(e) => setMetadata({ ...metadata, candidateTargetRole: e.target.value })}
                placeholder="e.g. Senior Product Manager"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Target Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Experience Level
              </label>
              <select
                value={metadata.experienceLevel}
                onChange={(e) => setMetadata({ ...metadata, experienceLevel: e.target.value as ExperienceLevel })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Company / Dept */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={metadata.companyName}
                onChange={(e) => setMetadata({ ...metadata, companyName: e.target.value })}
                placeholder="e.g. Google AI Studio"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Interview Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interview Date
              </label>
              <input
                type="date"
                value={metadata.interviewDate}
                onChange={(e) => setMetadata({ ...metadata, interviewDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

          </div>
        </div>

        {/* Right Columns: Topics Selection & Resume Upload */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Topic Categories Multi-Select */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  <span>Interview Topics & Competencies</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select the core pillars you wish to evaluate in this candidate round.
                </p>
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {metadata.selectedTopics.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOPIC_DEFINITIONS.map((topic) => {
                const isSelected = metadata.selectedTopics.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`p-3 rounded-xl text-left border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{topic.name}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {topic.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Candidate Resume Upload & AI Parser */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Candidate Resume & Background</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Upload candidate resume to extract achievements and generate personalized resume-derived questions.
                </p>
              </div>
              <span className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Parser Ready</span>
              </span>
            </div>

            {/* Tabs for Upload or Paste */}
            <div className="flex space-x-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'paste'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Paste Resume Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Upload File (.txt / .pdf)
              </button>
            </div>

            {activeTab === 'paste' ? (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={metadata.resumeText}
                  onChange={(e) => setMetadata({ ...metadata, resumeText: e.target.value })}
                  placeholder="Paste the candidate resume, work experience, or LinkedIn bio here..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

                {/* Sample Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Sample Resumes:</span>
                  {sampleResumes.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMetadata({ ...metadata, resumeText: sample.text });
                      }}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isParsingResume || !metadata.resumeText.trim()}
                    onClick={() => onParseResume(metadata.resumeText)}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-xs shadow-sm transition-colors"
                  >
                    {isParsingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Analyzing Resume & Generating Questions...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Parse Resume with Gemini AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50 hover:bg-indigo-50/20">
                  <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse or drop candidate resume file
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports text documents up to 5MB
                  </p>
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {fileError && (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fileError}</span>
                  </p>
                )}
              </div>
            )}

            {/* Parsed Resume Summary Preview */}
            {metadata.parsedResume && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Parsed Candidate Highlights</span>
                  </span>
                  <span className="text-[11px] font-semibold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                    {metadata.parsedResume.resumeDerivedQuestions.length} Resume Questions Added
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-purple-950">
                  <div>
                    <span className="font-semibold text-purple-800">Current Role:</span>{' '}
                    {metadata.parsedResume.currentRole || 'N/A'} ({metadata.parsedResume.yearsOfExperience || ''})
                  </div>
                  <div>
                    <span className="font-semibold text-purple-800">Key Domain:</span>{' '}
                    {(metadata.parsedResume.domainExpertise || []).join(', ') || 'General Product'}
                  </div>
                </div>

                {metadata.parsedResume.keySkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {metadata.parsedResume.keySkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-white border border-purple-200 text-purple-800 px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onContinue}
          disabled={!metadata.candidateName.trim() || metadata.selectedTopics.length === 0}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-colors text-sm"
        >
          <span>Continue to Question Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
