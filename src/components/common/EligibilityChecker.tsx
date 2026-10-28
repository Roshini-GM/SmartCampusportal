import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { EligibilityResult } from '../../types';

interface EligibilityCheckerProps {
  eligibility: EligibilityResult;
  compact?: boolean;
}

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({
  eligibility,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {eligibility.isEligible ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Eligible
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Not Eligible
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 ${
        eligibility.isEligible
          ? 'bg-emerald-50/50 border-emerald-200'
          : 'bg-amber-50/40 border-amber-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          {eligibility.isEligible ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You meet all eligibility criteria</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Eligibility Evaluation Breakdown</span>
            </>
          )}
        </h4>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            eligibility.isEligible
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-600 text-white'
          }`}
        >
          {eligibility.isEligible ? 'VERIFIED ELIGIBLE' : 'NOT ELIGIBLE'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {/* CGPA */}
        <div
          className={`flex items-start gap-2 p-2 rounded ${
            eligibility.cgpaSatisfied
              ? 'bg-white/80 text-emerald-900 border border-emerald-100'
              : 'bg-rose-50/80 text-rose-900 border border-rose-200'
          }`}
        >
          {eligibility.cgpaSatisfied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{eligibility.reasons.find((r) => r.includes('CGPA')) || 'CGPA Criterion'}</span>
        </div>

        {/* Department */}
        <div
          className={`flex items-start gap-2 p-2 rounded ${
            eligibility.deptSatisfied
              ? 'bg-white/80 text-emerald-900 border border-emerald-100'
              : 'bg-rose-50/80 text-rose-900 border border-rose-200'
          }`}
        >
          {eligibility.deptSatisfied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{eligibility.reasons.find((r) => r.includes('Department')) || 'Department Criterion'}</span>
        </div>

        {/* Graduation Year */}
        <div
          className={`flex items-start gap-2 p-2 rounded ${
            eligibility.yearSatisfied
              ? 'bg-white/80 text-emerald-900 border border-emerald-100'
              : 'bg-rose-50/80 text-rose-900 border border-rose-200'
          }`}
        >
          {eligibility.yearSatisfied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{eligibility.reasons.find((r) => r.includes('Graduation')) || 'Graduation Year Criterion'}</span>
        </div>

        {/* Backlogs */}
        <div
          className={`flex items-start gap-2 p-2 rounded ${
            eligibility.backlogSatisfied
              ? 'bg-white/80 text-emerald-900 border border-emerald-100'
              : 'bg-rose-50/80 text-rose-900 border border-rose-200'
          }`}
        >
          {eligibility.backlogSatisfied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{eligibility.reasons.find((r) => r.includes('Backlog')) || 'Backlogs Criterion'}</span>
        </div>
      </div>
    </div>
  );
};
