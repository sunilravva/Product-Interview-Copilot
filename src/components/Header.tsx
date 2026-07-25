import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  Clock, 
  FileText, 
  HelpCircle, 
  Mic, 
  Award, 
  Send,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { InterviewMetadata } from '../types';

interface HeaderProps {
  currentStep: number;
  setStep: (step: number) => void;
  metadata: InterviewMetadata;
  totalQuestions: number;
  answeredQuestions: number;
  isInterviewActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  setStep,
  metadata,
  totalQuestions,
  answeredQuestions,
  isInterviewActive,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isInterviewActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInterviewActive]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const steps = [
    { id: 1, label: 'Candidate Setup', icon: User },
    { id: 2, label: 'Question Plan', icon: HelpCircle },
    { id: 3, label: 'Live Interview', icon: Mic },
    { id: 4, label: 'Evaluation & Decision', icon: Award },
    { id: 5, label: 'Export & Send Email', icon: Send },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStep(1)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Product Interview Copilot
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PM / PO AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI-Assisted Candidate Interviewing & Decision Engine
              </p>
            </div>
          </div>

          {/* Center Info Badge (Candidate & Role) */}
          <div className="hidden lg:flex items-center space-x-4 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-1.5 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-white">{metadata.candidateName || 'Candidate Name'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{metadata.experienceLevel}</span>
            </div>

            {totalQuestions > 0 && (
              <>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    <strong className="text-emerald-400">{answeredQuestions}</strong>/{totalQuestions} Asked
                  </span>
                </div>
              </>
            )}

            {isInterviewActive && (
              <>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-medium">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>{formatTimer(seconds)}</span>
                </div>
              </>
            )}
          </div>

          {/* Interviewer Quick Badge */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-semibold text-slate-200">{metadata.interviewerName || 'Interviewer'}</p>
              <p className="text-[11px] text-slate-400">{metadata.companyName || 'Lead PM'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
              {(metadata.interviewerName || 'I').charAt(0)}
            </div>
          </div>

        </div>

        {/* Step Navigation Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setStep(step.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{step.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

      </div>
    </header>
  );
};
