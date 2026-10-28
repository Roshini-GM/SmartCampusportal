import React from 'react';
import { Modal } from '../common/Modal';
import { PlacementDrive, StudentProfile } from '../../types';
import { checkEligibility } from '../../utils/eligibility';
import { EligibilityChecker } from '../common/EligibilityChecker';
import { formatCurrency, formatStipend, formatDate } from '../../utils/formatters';
import { MapPin, Calendar, Briefcase, GraduationCap, Building2, CheckCircle, Clock } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface DriveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: PlacementDrive | null;
  student: StudentProfile | null;
  hasApplied: boolean;
  onApplySuccess: () => void;
}

export const DriveDetailsModal: React.FC<DriveDetailsModalProps> = ({
  isOpen,
  onClose,
  drive,
  student,
  hasApplied,
  onApplySuccess,
}) => {
  const { showToast } = useToast();
  if (!drive) return null;

  const eligibility = checkEligibility(student, drive);

  const handleApply = () => {
    if (!student) {
      showToast('Please sign in as a student to apply', 'warning');
      return;
    }
    if (!eligibility.isEligible) {
      showToast('You do not meet all eligibility criteria for this drive', 'error');
      return;
    }

    storageService.applyToDrive(student, drive);
    showToast(`Successfully applied to ${drive.companyName} for ${drive.role}!`, 'success');
    onApplySuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${drive.companyName} — Recruitment Drive`}
      subtitle={`Job Role: ${drive.role} (${drive.type})`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Top Summary Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
              {drive.companyLogo ? (
                <img
                  src={drive.companyLogo}
                  alt={drive.companyName}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Building2 className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{drive.role}</h4>
              <p className="text-xs text-slate-600 font-medium">{drive.companyName}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Compensation</p>
            <p className="text-xl font-extrabold text-indigo-700 font-mono">
              {formatCurrency(drive.packageLpa)}
            </p>
            {drive.stipendPerMonth && (
              <p className="text-2xs text-slate-500">
                Stipend: {formatStipend(drive.stipendPerMonth)}
              </p>
            )}
          </div>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-400 text-2xs uppercase tracking-wider font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </p>
            <p className="font-semibold text-slate-800 mt-1 truncate">{drive.location}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-400 text-2xs uppercase tracking-wider font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Deadline
            </p>
            <p className="font-semibold text-slate-800 mt-1">{formatDate(drive.deadline)}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-400 text-2xs uppercase tracking-wider font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Drive Date
            </p>
            <p className="font-semibold text-slate-800 mt-1">{formatDate(drive.driveDate)}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-400 text-2xs uppercase tracking-wider font-medium flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Batch Year
            </p>
            <p className="font-semibold text-slate-800 mt-1">Class of {drive.graduationYear}</p>
          </div>
        </div>

        {/* Automated Eligibility Engine Assessment */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Automated Eligibility Verification
          </h4>
          <EligibilityChecker eligibility={eligibility} />
        </div>

        {/* Job Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Role Description & Scope
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
            {drive.description}
          </p>
        </div>

        {/* Required Technical Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Key Competencies & Required Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {drive.requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Selection Process / Rounds */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Recruitment Process Stages
          </h4>
          <div className="flex flex-col sm:flex-row gap-2">
            {drive.rounds.map((round, idx) => (
              <div
                key={idx}
                className="flex-1 p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                <span className="text-2xs font-bold text-indigo-600 block uppercase">
                  Round {idx + 1}
                </span>
                <span className="font-medium text-slate-800 mt-0.5 block">{round}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close Details
          </button>

          {hasApplied ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>You Have Applied to this Drive</span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={!eligibility.isEligible}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                eligibility.isEligible
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{eligibility.isEligible ? 'Submit Application' : 'Ineligible to Apply'}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
