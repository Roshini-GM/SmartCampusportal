import React, { useState } from 'react';
import { PlacementDrive, StudentProfile, Application } from '../../types';
import { checkEligibility } from '../../utils/eligibility';
import { formatCurrency, formatStipend, formatDate } from '../../utils/formatters';
import { EligibilityChecker } from '../common/EligibilityChecker';
import { DriveDetailsModal } from './DriveDetailsModal';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  CheckCircle,
  SlidersHorizontal,
} from 'lucide-react';

interface StudentDrivesViewProps {
  drives: PlacementDrive[];
  student: StudentProfile;
  applications: Application[];
  initialTypeFilter?: 'all' | 'Full-Time' | 'Internship';
  title?: string;
  subtitle?: string;
  onRefreshData: () => void;
}

export const StudentDrivesView: React.FC<StudentDrivesViewProps> = ({
  drives,
  student,
  applications,
  initialTypeFilter = 'all',
  title = 'Campus Placement Drives',
  subtitle = 'Browse verified full-time job openings and submit applications',
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>(initialTypeFilter);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  // Filter logic
  const filteredDrives = drives.filter((drive) => {
    // Type filter
    if (selectedType === 'Full-Time' && drive.type !== 'Full-Time') return false;
    if (
      selectedType === 'Internship' &&
      drive.type !== 'Internship' &&
      drive.type !== 'Internship + PPO'
    ) {
      return false;
    }

    // Eligibility toggle
    if (onlyEligible) {
      const eligibility = checkEligibility(student, drive);
      if (!eligibility.isEligible) return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCompany = drive.companyName.toLowerCase().includes(term);
      const matchRole = drive.role.toLowerCase().includes(term);
      const matchSkills = drive.requiredSkills.some((s) => s.toLowerCase().includes(term));
      const matchLocation = drive.location.toLowerCase().includes(term);
      if (!matchCompany && !matchRole && !matchSkills && !matchLocation) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {filteredDrives.length} Available Drives
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by company, role, skills, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Drive Type Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('Full-Time')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'Full-Time'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full-Time
            </button>
            <button
              onClick={() => setSelectedType('Internship')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'Internship'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Internships
            </button>
          </div>

          {/* Toggle for Only Eligible */}
          <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={(e) => setOnlyEligible(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show Only Eligible</span>
          </label>
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No matching placement drives found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or unchecking "Show Only Eligible" to view all campus opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDrives.map((drive) => {
            const eligibility = checkEligibility(student, drive);
            const hasApplied = applications.some((a) => a.driveId === drive.id);

            return (
              <div
                key={drive.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Row: Logo, Company & Package */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                        {drive.companyLogo ? (
                          <img
                            src={drive.companyLogo}
                            alt={drive.companyName}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {drive.companyName}
                        </h4>
                        <p className="text-xs text-indigo-700 font-semibold">{drive.role}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-slate-900 font-mono block">
                        {formatCurrency(drive.packageLpa)}
                      </span>
                      {drive.stipendPerMonth && (
                        <span className="text-2xs text-slate-500 block">
                          Stipend: {formatStipend(drive.stipendPerMonth)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Chips: Type, Location, Deadline */}
                  <div className="flex flex-wrap items-center gap-2 text-2xs text-slate-500 pt-1">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {drive.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {drive.location}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Deadline: {formatDate(drive.deadline)}
                    </span>
                  </div>

                  {/* Brief snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {drive.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {drive.requiredSkills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {drive.requiredSkills.length > 3 && (
                      <span className="text-2xs text-slate-400 px-1 py-0.5">
                        +{drive.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions & Eligibility state */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <EligibilityChecker eligibility={eligibility} compact />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
                    >
                      View Criteria
                    </button>

                    {hasApplied ? (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedDrive(drive)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          eligibility.isEligible
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
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
