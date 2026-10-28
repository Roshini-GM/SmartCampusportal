import React, { useState } from 'react';
import { Offer, Application, StudentProfile, Company } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Award, Plus, CheckCircle2, Building2, User, FileText, Send } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface ResultsAndOffersProps {
  offers: Offer[];
  applications: Application[];
  students: StudentProfile[];
  companies: Company[];
  onRefreshData: () => void;
}

export const ResultsAndOffers: React.FC<ResultsAndOffersProps> = ({
  offers,
  applications,
  students,
  companies,
  onRefreshData,
}) => {
  const { showToast } = useToast();
  const [showIssueOfferModal, setShowIssueOfferModal] = useState(false);

  // New offer form
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [companyName, setCompanyName] = useState(companies[0]?.name || 'Microsoft India');
  const [role, setRole] = useState('Software Engineer');
  const [packageLpa, setPackageLpa] = useState<number>(14.0);
  const [joiningDate, setJoiningDate] = useState('2026-07-15');
  const [letterText, setLetterText] = useState(
    'Congratulations! On behalf of our hiring directorate, we are delighted to extend a formal offer of campus employment.'
  );

  const selectedCandidates = applications.filter((a) => a.status === 'Selected');

  const handleIssueOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      showToast('Please select a student', 'warning');
      return;
    }
    const comp = companies.find((c) => c.name === companyName);

    storageService.issueOffer({
      studentId: student.id,
      studentName: student.name,
      studentRegNo: student.registerNumber,
      companyName,
      companyLogo: comp?.logo,
      role,
      packageLpa: Number(packageLpa),
      joiningDate,
      status: 'Pending',
      letterText: `Dear ${student.name}, ${letterText} Role: ${role}, Compensation: INR ${packageLpa} LPA.`,
    });

    showToast(`Formal offer issued to ${student.name}!`, 'success');
    setShowIssueOfferModal(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Placement Results & Offer Management</h2>
          <p className="text-xs text-slate-500">
            Publish finalized selection merit lists, roll out formal offers, and verify acceptances.
          </p>
        </div>

        <button
          onClick={() => setShowIssueOfferModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Award className="w-4 h-4" />
          Issue Official Offer
        </button>
      </div>

      {/* Grid: Finalized Selections & Issued Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Finalized Selections Merit List */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Selected Candidates Pool ({selectedCandidates.length})
            </h3>
            <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Selections
            </span>
          </div>

          {selectedCandidates.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No candidates marked Selected yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {selectedCandidates.map((sel) => (
                <div
                  key={sel.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{sel.studentName}</p>
                    <p className="text-2xs text-slate-500 font-mono">
                      {sel.studentRegNo} · {sel.studentDept}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{sel.companyName}</p>
                    <p className="text-2xs text-emerald-700 font-mono font-bold">
                      {formatCurrency(sel.packageLpa)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Issued Offer Letters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Issued Offer Letters ({offers.length})
            </h3>
            <span className="text-2xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Repository
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {offers.map((off) => {
              const isAccepted = off.status === 'Accepted';

              return (
                <div
                  key={off.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{off.studentName}</p>
                      <p className="text-2xs text-slate-500 font-medium">
                        {off.companyName} · {off.role}
                      </p>
                    </div>
                    <span
                      className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {off.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-2xs pt-1 border-t border-slate-100">
                    <span className="font-mono text-emerald-700 font-bold text-xs">
                      {formatCurrency(off.packageLpa)}
                    </span>
                    <span className="text-slate-400">
                      Joining: {formatDate(off.joiningDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Issue Offer Modal */}
      {showIssueOfferModal && (
        <Modal
          isOpen={showIssueOfferModal}
          onClose={() => setShowIssueOfferModal(false)}
          title="Issue Official Placement Offer Letter"
          subtitle="Generate binding corporate offer record and dispatch to student dashboard"
          maxWidth="md"
        >
          <form onSubmit={handleIssueOffer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Candidate Recipient *
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.registerNumber}) — {s.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employing Enterprise *
                </label>
                <select
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CTC Package (in LPA) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={packageLpa}
                  onChange={(e) => setPackageLpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono font-bold text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anticipated Joining Date *
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formal Letter Content & Directives
              </label>
              <textarea
                rows={3}
                value={letterText}
                onChange={(e) => setLetterText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowIssueOfferModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Formal Offer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
