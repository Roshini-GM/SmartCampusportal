import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { UserRole } from '../../types';
import { getRoleDisplayName } from '../../utils/rbac';

interface AccessDeniedViewProps {
  currentRole: UserRole;
  attemptedTab: string;
  onReturnToDashboard: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  currentRole,
  attemptedTab,
  onReturnToDashboard,
}) => {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <span className="text-2xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
          Access Restricted (403 Forbidden)
        </span>

        <h2 className="text-xl font-bold text-slate-900 mt-4 mb-2">
          Role-Based Access Control Violation
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          You are currently logged in as a{' '}
          <strong className="text-slate-900 font-semibold">{getRoleDisplayName(currentRole)}</strong>.
          The requested section (<code className="font-mono text-indigo-700 bg-slate-100 px-1.5 py-0.5 rounded text-2xs">{attemptedTab}</code>) requires elevated role permissions.
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-2xs text-slate-500 mb-6 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Enforced Permissions:</span>
          </div>
          <p>• Students cannot view administrative records or tamper with drives.</p>
          <p>• Placement Officers manage the universal roster and verify accreditation data.</p>
          <p>• Recruiters only access their own posted job pipelines and applicants.</p>
        </div>

        <button
          onClick={onReturnToDashboard}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};
