import React, { useState } from 'react';
import { Application, PlacementDrive, ApplicationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import { Search, Filter, Calendar, Award, CheckCircle, XCircle } from 'lucide-react';

interface ApplicationManagementProps {
  applications: Application[];
  drives: PlacementDrive[];
  onRefreshData: () => void;
  onScheduleInterviewForApp?: (app: Application) => void;
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  applications,
  drives,
  onRefreshData,
  onScheduleInterviewForApp,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriveId, setSelectedDriveId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    storageService.updateApplicationStatus(appId, newStatus);
    showToast(`Application updated to "${newStatus}"`, 'success');
    onRefreshData();
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedDriveId !== 'all' && app.driveId !== selectedDriveId) return false;
    if (selectedStatus !== 'all' && app.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchStudent = app.studentName.toLowerCase().includes(term);
      const matchReg = app.studentRegNo.toLowerCase().includes(term);
      const matchComp = app.companyName.toLowerCase().includes(term);
      const matchRole = app.role.toLowerCase().includes(term);
      if (!matchStudent && !matchReg && !matchComp && !matchRole) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Application Pipeline Management</h2>
          <p className="text-xs text-slate-500">
            Review submissions, advance candidates across screening rounds, and schedule evaluations.
          </p>
        </div>

        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
          {filteredApplications.length} Submissions Filtered
        </span>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student, roll no, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
          >
            <option value="all">All Placement Drives ({drives.length})</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.companyName} — {d.role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
          >
            <option value="all">All Screening Stages</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-2xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Department & CGPA</th>
                <th className="py-3 px-4">Recruiting Enterprise & Role</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Status Transition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{app.studentName}</p>
                    <p className="text-2xs text-slate-400 font-mono">{app.studentRegNo}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <p>{app.studentDept}</p>
                    <p className="text-2xs text-indigo-700 font-mono font-bold">
                      CGPA: {app.studentCgpa.toFixed(2)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{app.companyName}</p>
                    <p className="text-2xs text-slate-600">{app.role}</p>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {formatCurrency(app.packageLpa)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value as ApplicationStatus)
                      }
                      className="px-2 py-1 text-2xs border border-slate-300 rounded focus:outline-hidden bg-white font-medium"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {app.status === 'Shortlisted' && onScheduleInterviewForApp && (
                      <button
                        onClick={() => onScheduleInterviewForApp(app)}
                        className="px-2.5 py-1 text-2xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Calendar className="w-3 h-3" />
                        Schedule
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
