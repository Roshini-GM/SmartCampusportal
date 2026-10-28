import React, { useState } from 'react';
import {
  StudentProfile,
  PlacementDrive,
  Application,
  Interview,
  Offer,
} from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { EligibilityChecker } from '../common/EligibilityChecker';
import { checkEligibility } from '../../utils/eligibility';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Briefcase,
  FileCheck2,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DriveDetailsModal } from './DriveDetailsModal';

interface StudentDashboardProps {
  student: StudentProfile;
  drives: PlacementDrive[];
  applications: Application[];
  interviews: Interview[];
  offers: Offer[];
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  drives,
  applications,
  interviews,
  offers,
  onNavigateTab,
  onRefreshData,
}) => {
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  // Profile completion calculation
  const calcProfileScore = () => {
    let score = 0;
    if (student.name && student.email) score += 20;
    if (student.registerNumber && student.department) score += 20;
    if (student.cgpa) score += 15;
    if (student.skills && student.skills.length > 0) score += 15;
    if (student.projects && student.projects.length > 0) score += 15;
    if (student.resumeName) score += 15;
    return Math.min(score, 100);
  };
  const profileScore = calcProfileScore();

  // Eligible drives calculation
  const eligibleDrives = drives.filter(
    (d) => d.status === 'active' && checkEligibility(student, d).isEligible
  );

  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const upcomingInterviewsCount = interviews.filter((i) => i.status === 'Scheduled').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-2xs font-medium border border-indigo-400/20">
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>Campus Recruitment Season 2025–2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {student.name}!
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              {student.department} · {student.registerNumber} · CGPA:{' '}
              <strong className="text-white font-mono">{student.cgpa.toFixed(2)}</strong> · Active Arrears: {student.backlogs}
            </p>
          </div>

          {/* Profile Progress Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-indigo-200">Profile Completion</span>
              <span className="font-mono text-white font-bold">{profileScore}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileScore}%` }}
              />
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-2xs text-indigo-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Update academic profile</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Profile Score"
          value={`${profileScore}%`}
          subtitle="Verified Status"
          icon={<CheckCircle2 className="w-5 h-5" />}
          onClick={() => onNavigateTab('profile')}
        />
        <StatCard
          label="Eligible Drives"
          value={eligibleDrives.length}
          subtitle="Qualified to apply"
          icon={<Briefcase className="w-5 h-5" />}
          onClick={() => onNavigateTab('drives')}
        />
        <StatCard
          label="Applications"
          value={applications.length}
          subtitle="Submitted"
          icon={<FileCheck2 className="w-5 h-5" />}
          onClick={() => onNavigateTab('applications')}
        />
        <StatCard
          label="Shortlisted"
          value={shortlistedCount}
          subtitle="Cleared tests"
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />}
          onClick={() => onNavigateTab('applications')}
        />
        <StatCard
          label="Interviews"
          value={upcomingInterviewsCount}
          subtitle="Scheduled"
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
          onClick={() => onNavigateTab('interviews')}
        />
        <StatCard
          label="Offers"
          value={offers.length}
          subtitle={student.placed ? 'Offer Accepted' : 'In Review'}
          icon={<Award className="w-5 h-5 text-emerald-600" />}
          onClick={() => onNavigateTab('offers')}
        />
      </div>

      {/* Grid: Upcoming Drives & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Placement Drives */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Placement Drives</h3>
              <p className="text-2xs text-slate-500">Live recruitment opportunities and campus dates</p>
            </div>
            <button
              onClick={() => onNavigateTab('drives')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>View All ({drives.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {drives.slice(0, 4).map((drive) => {
              const eligibility = checkEligibility(student, drive);
              const hasApplied = applications.some((a) => a.driveId === drive.id);

              return (
                <div
                  key={drive.id}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{drive.companyName}</span>
                        <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {formatCurrency(drive.packageLpa)}
                        </span>
                        <span className="text-2xs px-2 py-0.2 rounded bg-slate-200 text-slate-700">
                          {drive.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{drive.role}</p>
                      <div className="flex flex-wrap items-center gap-3 text-2xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {drive.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Deadline: {formatDate(drive.deadline)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <EligibilityChecker eligibility={eligibility} compact />
                      <button
                        onClick={() => setSelectedDrive(drive)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          hasApplied
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : eligibility.isEligible
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {hasApplied ? 'Applied' : 'Details & Apply'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Application Status Tracker */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Application Status</h3>
                <p className="text-2xs text-slate-500">Live progress across active evaluations</p>
              </div>
              <button
                onClick={() => onNavigateTab('applications')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>All ({applications.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You have not submitted any applications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {app.companyName}
                      </p>
                      <p className="text-2xs text-slate-600 truncate">{app.role}</p>
                      <p className="text-2xs text-slate-400 mt-0.5">Applied: {app.appliedDate}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <StatusBadge status={app.status} size="sm" />
                      {app.status === 'Interview Scheduled' && (
                        <button
                          onClick={() => onNavigateTab('interviews')}
                          className="block text-2xs text-purple-700 hover:underline mt-1 font-medium"
                        >
                          View Schedule →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Interview Teaser if any */}
          {interviews.filter((i) => i.status === 'Scheduled').length > 0 && (
            <div className="mt-4 p-3.5 rounded-lg bg-purple-50/70 border border-purple-200">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 mb-1">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Next Scheduled Interview</span>
              </div>
              {(() => {
                const nextInt = interviews.find((i) => i.status === 'Scheduled')!;
                return (
                  <div className="text-xs text-purple-800">
                    <p className="font-semibold">{nextInt.companyName} · {nextInt.roundName}</p>
                    <p className="text-2xs text-purple-600 mt-0.5">
                      {formatDate(nextInt.date)} at {nextInt.time} ({nextInt.mode})
                    </p>
                    <button
                      onClick={() => onNavigateTab('interviews')}
                      className="mt-2 text-2xs font-semibold text-white bg-purple-700 hover:bg-purple-800 px-2.5 py-1 rounded transition-colors inline-block"
                    >
                      Open Meeting Room
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Drive Details Modal */}
      <DriveDetailsModal
        isOpen={!!selectedDrive}
        onClose={() => setSelectedDrive(null)}
        drive={selectedDrive}
        student={student}
        hasApplied={applications.some((a) => a.driveId === selectedDrive?.id)}
        onApplySuccess={() => {
          onRefreshData();
        }}
      />
    </div>
  );
};
