import React from 'react';
import { Application, Interview, Offer } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileCheck2,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface MyApplicationsProps {
  applications: Application[];
  interviews: Interview[];
  offers: Offer[];
  onNavigateTab: (tab: string) => void;
}

const STAGES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
] as const;

export const MyApplications: React.FC<MyApplicationsProps> = ({
  applications,
  interviews,
  offers,
  onNavigateTab,
}) => {
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'Applied':
        return 0;
      case 'Under Review':
        return 1;
      case 'Shortlisted':
        return 2;
      case 'Interview Scheduled':
        return 3;
      case 'Selected':
        return 4;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Placement Applications</h2>
          <p className="text-xs text-slate-500">
            Track recruitment progress, screening feedback, and scheduled evaluation stages.
          </p>
        </div>

        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
          {applications.length} Active Submissions
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Browse through active placement drives and submit your profile for eligible corporate openings.
          </p>
          <button
            onClick={() => onNavigateTab('drives')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Explore Active Drives
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentIdx = getStageIndex(app.status);
            const isRejected = app.status === 'Rejected';
            const relatedInterview = interviews.find(
              (i) => i.applicationId === app.id || (i.studentId === app.studentId && i.role === app.role)
            );
            const relatedOffer = offers.find(
              (o) => o.studentId === app.studentId && o.companyName === app.companyName
            );

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                      {app.companyLogo ? (
                        <img
                          src={app.companyLogo}
                          alt={app.companyName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.companyName}</h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {app.role} ·{' '}
                        <span className="font-mono text-indigo-700 font-semibold">
                          {formatCurrency(app.packageLpa)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xs text-slate-400">
                      Applied: {formatDate(app.appliedDate)}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                </div>

                {/* Visual Pipeline Stepper */}
                {!isRejected ? (
                  <div className="py-2">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-500 -z-0"
                        style={{
                          width: `${(Math.max(0, currentIdx) / (STAGES.length - 1)) * 100}%`,
                        }}
                      />

                      {STAGES.map((stage, idx) => {
                        const isDone = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div
                            key={stage}
                            className="flex flex-col items-center relative z-10 bg-white px-2"
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                  : isDone
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-2xs mt-1.5 font-medium hidden sm:block ${
                                isCurrent
                                  ? 'text-indigo-700 font-bold'
                                  : isDone
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Application not advanced after evaluation round.</span>
                  </div>
                )}

                {/* Sub-cards: Interview / Offer action links */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  {app.notes ? (
                    <p className="text-slate-500 text-2xs italic max-w-md">
                      Recruiter Note: “{app.notes}”
                    </p>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-3">
                    {relatedInterview && (
                      <button
                        onClick={() => onNavigateTab('interviews')}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Interview Details ({formatDate(relatedInterview.date)})</span>
                      </button>
                    )}

                    {relatedOffer && (
                      <button
                        onClick={() => onNavigateTab('offers')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View Offer Letter (₹{relatedOffer.packageLpa} LPA)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
