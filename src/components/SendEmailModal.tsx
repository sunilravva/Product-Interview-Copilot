import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Mail, 
  Loader2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { InterviewEvaluation, InterviewMetadata } from '../types';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: InterviewEvaluation;
  metadata: InterviewMetadata;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  metadata,
}) => {
  const [recipient, setRecipient] = useState('recruiter@company.com');
  const [subject, setSubject] = useState(
    `[Interview Feedback] ${metadata.candidateName} — ${metadata.candidateTargetRole} — Recommendation: ${evaluation.overallDecision}`
  );
  const [bodyText, setBodyText] = useState(
    evaluation.recruiterEmailBody ||
      `PRODUCT INTERVIEW FEEDBACK SUMMARY
Candidate: ${metadata.candidateName}
Target Role: ${metadata.candidateTargetRole} (${metadata.experienceLevel})
Interviewer: ${metadata.interviewerName} (${metadata.companyName})
Date: ${metadata.interviewDate}

RECOMMENDATION: ${evaluation.overallDecision}
Overall Score: ${evaluation.overallScore.toFixed(1)} / 5.0

EXECUTIVE SUMMARY:
${evaluation.executiveSummary}

KEY STRENGTHS:
${evaluation.keyStrengths.map((s) => `• ${s}`).join('\n')}

AREAS OF CONCERN:
${evaluation.areasOfConcern.map((a) => `• ${a}`).join('\n')}

HIRING RECOMMENDATION:
${evaluation.hiringRecommendation}`
  );

  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendDirect = async () => {
    setIsSending(true);
    setSentSuccess(false);

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject,
          body: bodyText,
          metadata,
        }),
      });

      if (res.ok) {
        setSentSuccess(true);
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error sending email:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(bodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Send Interview Summary Email</h2>
              <p className="text-xs text-slate-500">
                Dispatch structured hiring decision feedback to HR recruiter and hiring team.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Form */}
        <div className="space-y-4 text-xs">
          
          {/* Recruiter Email */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Recipient Email Address</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. recruiter@company.com, hiring-manager@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
            />
          </div>

          {/* Subject Line */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
            />
          </div>

          {/* Email Body Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Formatted Email Summary Report</label>
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Report'}</span>
              </button>
            </div>
            <textarea
              rows={10}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-[11px] leading-relaxed bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>

        {/* Success Toast Banner */}
        {sentSuccess && (
          <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>Feedback email dispatched successfully!</span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleOpenMailto}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Desktop Email App</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSending || !recipient.trim()}
              onClick={handleSendDirect}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Email Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
