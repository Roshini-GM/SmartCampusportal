import React from 'react';
import { Application, StudentProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckSquare, Calendar, Building2, User, ArrowRight } from 'lucide-react';

interface ShortlistedCandidatesProps {
  applications: Application[];
  students: StudentProfile[];
  onScheduleInterview: (app: Application) => void;
  onNavigateTab: (tab: string) => void;
}

export const ShortlistedCandidates: React.FC<ShortlistedCandidatesProps> = ({
  applications,
  students,
  onScheduleInterview,
  onNavigateTab,
}) => {
  const shortlisted = applications.filter((a) => a.status === 'Shortlisted');

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Shortlisted Candidates Pool</h2>
          <p className="text-xs text-slate-500">
            Candidates cleared after online assessments and eligible for interview scheduling.
          </p>
        </div>

        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
          {shortlisted.length} Candidates Ready for Interviews
        </span>
      </div>

      {shortlisted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No candidates currently in shortlisted stage</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Review incoming applications from the Applications tab and advance qualified students to "Shortlisted".
          </p>
          <button
            onClick={() => onNavigateTab('applications')}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Go to Applications Tab
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shortlisted.map((app) => {
            const student = students.find((s) => s.id === app.studentId || s.name === app.studentName);

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.studentName}</h4>
                      <p className="text-2xs text-slate-400 font-mono">
                        {app.studentRegNo} · {app.studentDept}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      CGPA {app.studentCgpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      {app.companyName}
                    </p>
                    <p className="text-2xs text-slate-600">
                      Role: {app.role} ({formatCurrency(app.packageLpa)})
                    </p>
                    {app.notes && (
                      <p className="text-2xs text-slate-500 italic mt-1">“{app.notes}”</p>
                    )}
                  </div>

                  {student?.skills && (
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 3).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-2xs"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-2xs text-slate-400">Ready for Interview</span>
                  <button
                    onClick={() => onScheduleInterview(app)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Interview</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
