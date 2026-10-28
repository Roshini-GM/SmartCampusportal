import React, { useState } from 'react';
import {
  Company,
  PlacementDrive,
  Application,
  Interview,
  Offer,
  StudentProfile,
  ApplicationStatus,
} from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import {
  Briefcase,
  Users,
  CheckSquare,
  Calendar,
  Award,
  Plus,
  Building2,
  Save,
  Eye,
  FileText,
  Video,
  Send,
  ExternalLink,
} from 'lucide-react';
import { CreateDriveModal } from '../admin/CreateDriveModal';

interface RecruiterDashboardProps {
  company: Company;
  drives: PlacementDrive[];
  applications: Application[];
  interviews: Interview[];
  offers: Offer[];
  students: StudentProfile[];
  onRefreshData: () => void;
  onNavigateTab: (tab: string) => void;
}

export const RecruiterDashboardView: React.FC<RecruiterDashboardProps> = ({
  company,
  drives,
  applications,
  interviews,
  offers,
  students,
  onRefreshData,
  onNavigateTab,
}) => {
  const { showToast } = useToast();
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentProfile | null>(
    null
  );
  const [showPostJob, setShowPostJob] = useState(false);

  // Recruiter-specific items
  const myDrives = drives.filter(
    (d) => d.companyId === company.id || d.companyName.toLowerCase() === company.name.toLowerCase()
  );
  const myDriveIds = new Set(myDrives.map((d) => d.id));

  const myApplications = applications.filter(
    (a) =>
      myDriveIds.has(a.driveId) ||
      a.companyName.toLowerCase().includes(company.name.toLowerCase().split(' ')[0])
  );
  const myShortlisted = myApplications.filter((a) => a.status === 'Shortlisted');
  const myInterviews = interviews.filter((i) =>
    i.companyName.toLowerCase().includes(company.name.toLowerCase().split(' ')[0])
  );
  const mySelected = myApplications.filter((a) => a.status === 'Selected');

  const handleStatusUpdate = (appId: string, status: ApplicationStatus) => {
    storageService.updateApplicationStatus(appId, status);
    showToast(`Applicant status changed to ${status}`, 'success');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-400/20">
                Corporate Recruitment Portal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {company.name} Talent Acquisition Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Source verified engineering graduates, filter candidates by technical proficiencies, and conduct interview screening rounds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPostJob(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Post New Opportunity
            </button>
          </div>
        </div>
      </div>

      {/* Recruiter Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard
          label="Active Jobs"
          value={myDrives.length}
          subtitle="Open Roles"
          icon={<Briefcase className="w-5 h-5" />}
          onClick={() => onNavigateTab('manage_jobs')}
        />
        <StatCard
          label="Total Applicants"
          value={myApplications.length}
          subtitle="Pre-Screened"
          icon={<Users className="w-5 h-5" />}
          onClick={() => onNavigateTab('applicants')}
        />
        <StatCard
          label="Shortlisted"
          value={myShortlisted.length}
          subtitle="Cleared Tests"
          icon={<CheckSquare className="w-5 h-5 text-indigo-600" />}
          onClick={() => onNavigateTab('shortlisted')}
        />
        <StatCard
          label="Interviews"
          value={myInterviews.length}
          subtitle="Scheduled"
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
          onClick={() => onNavigateTab('interviews')}
        />
        <StatCard
          label="Selected"
          value={mySelected.length}
          subtitle="Hired"
          icon={<Award className="w-5 h-5 text-emerald-600" />}
          onClick={() => onNavigateTab('selected')}
        />
      </div>

      {/* Applicant Review Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Candidate Pipeline for {company.name}
            </h3>
            <p className="text-2xs text-slate-500">
              Screening applicants across active campus drives
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('applicants')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Full Pipeline ({myApplications.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-2xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Applied Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myApplications.slice(0, 6).map((app) => {
                const student = students.find(
                  (s) => s.id === app.studentId || s.name === app.studentName
                );

                return (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{app.studentName}</p>
                      <p className="text-2xs text-slate-400 font-mono">{app.studentRegNo}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{app.studentDept}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {app.studentCgpa.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{app.role}</p>
                      <p className="text-2xs text-slate-400 font-mono">
                        {formatCurrency(app.packageLpa)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {app.status === 'Applied' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'Under Review')}
                            className="px-2 py-0.5 text-2xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100"
                          >
                            Review
                          </button>
                        )}
                        {app.status === 'Under Review' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'Shortlisted')}
                            className="px-2 py-0.5 text-2xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status === 'Interview Scheduled' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'Selected')}
                            className="px-2 py-0.5 text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                          >
                            Select & Hire
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {student && (
                        <button
                          onClick={() => setSelectedStudentForModal(student)}
                          className="px-2.5 py-1 text-2xs font-semibold text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedStudentForModal && (
        <Modal
          isOpen={!!selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          title={`Candidate Profile: ${selectedStudentForModal.name}`}
          subtitle={`${selectedStudentForModal.registerNumber} · ${selectedStudentForModal.department}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Department</p>
                <p className="font-semibold text-slate-900">{selectedStudentForModal.department}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Cumulative CGPA</p>
                <p className="font-mono font-bold text-indigo-700 text-sm">
                  {selectedStudentForModal.cgpa.toFixed(2)} / 10.0
                </p>
              </div>
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Backlogs</p>
                <p className="font-medium text-slate-900">{selectedStudentForModal.backlogs} standing</p>
              </div>
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Resume Document</p>
                <p className="font-medium text-indigo-600">
                  {selectedStudentForModal.resumeName || 'Verified_Resume.pdf'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Technical Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudentForModal.skills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-2xs font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Projects
              </p>
              <div className="space-y-2">
                {(selectedStudentForModal.projects || []).map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded border border-slate-200 bg-white">
                    <p className="font-semibold text-slate-900">{p.title}</p>
                    <p className="text-2xs text-slate-600 mt-0.5">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Post Job Modal */}
      {showPostJob && (
        <CreateDriveModal
          isOpen={showPostJob}
          onClose={() => setShowPostJob(false)}
          companies={[company]}
          onCreated={() => {
            onRefreshData();
          }}
        />
      )}
    </div>
  );
};

export const CompanyProfileView: React.FC<{
  company: Company;
  onRefreshData: () => void;
  onOpenEditProfile?: () => void;
}> = ({ company, onRefreshData, onOpenEditProfile }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Company>({ ...company });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateCompany(formData);
    showToast('Company profile updated successfully!', 'success');
    onRefreshData();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Corporate Employer Profile</h2>
          <p className="text-xs text-slate-500">
            Brand overview, official recruitment email, and office locations presented to students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEditProfile && (
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Edit Recruiter Lead Profile
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Company Details
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recruitment Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Lead / Contact Person
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Enterprise Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>
    </form>
  );
};
