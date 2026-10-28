import React, { useState } from 'react';
import { PlacementDrive, Company, Application } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreateDriveModal } from './CreateDriveModal';
import {
  Briefcase,
  Plus,
  MapPin,
  Calendar,
  Building2,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface DriveManagementProps {
  drives: PlacementDrive[];
  companies: Company[];
  applications: Application[];
  onRefreshData: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DriveManagement: React.FC<DriveManagementProps> = ({
  drives,
  companies,
  applications,
  onRefreshData,
  onNavigateTab,
}) => {
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  const handleToggleStatus = (drive: PlacementDrive) => {
    const nextStatus = drive.status === 'active' ? 'closed' : 'active';
    storageService.updateDrive({
      ...drive,
      status: nextStatus,
    });
    showToast(`Drive status for ${drive.companyName} set to ${nextStatus}`, 'info');
    onRefreshData();
  };

  const filteredDrives = drives.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Placement & Internship Drives</h2>
          <p className="text-xs text-slate-500">
            Publish recruitment notifications, manage eligibility cutoffs, and monitor applicant volume.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Recruitment Drive
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Drives ({drives.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Active ({drives.filter((d) => d.status === 'active').length})
        </button>
        <button
          onClick={() => setStatusFilter('closed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            statusFilter === 'closed'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Closed ({drives.filter((d) => d.status === 'closed').length})
        </button>
      </div>

      {/* Drive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDrives.map((drive) => {
          const appCount = applications.filter((a) => a.driveId === drive.id).length;
          const isActive = drive.status === 'active';

          return (
            <div
              key={drive.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
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
                      <h4 className="text-sm font-bold text-slate-900">{drive.companyName}</h4>
                      <p className="text-xs text-indigo-700 font-semibold">{drive.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {formatCurrency(drive.packageLpa)}
                    </span>
                    <span
                      className={`text-2xs font-semibold px-2 py-0.5 rounded uppercase ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {drive.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-2xs space-y-1 text-slate-600">
                  <p>
                    <strong>Eligibility:</strong> Min CGPA {drive.minCgpa} · Max Arrears: {drive.maxBacklogs}
                  </p>
                  <p className="truncate">
                    <strong>Branches:</strong> {drive.eligibleDepartments.join(', ')}
                  </p>
                  <p>
                    <strong>Drive Date:</strong> {formatDate(drive.driveDate)} · Deadline:{' '}
                    {formatDate(drive.deadline)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  {appCount} Candidates Applied
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(drive)}
                    className="px-2.5 py-1 text-2xs font-medium border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    {isActive ? 'Close Drive' : 'Reopen'}
                  </button>

                  <button
                    onClick={() => onNavigateTab('applications')}
                    className="px-3 py-1 text-2xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded transition-colors"
                  >
                    Review Applicants →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreateDriveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        companies={companies}
        onCreated={onRefreshData}
      />
    </div>
  );
};
