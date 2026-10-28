import React, { useState } from 'react';
import { Offer, StudentProfile } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import {
  Award,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  Building2,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface StudentOffersProps {
  offers: Offer[];
  student: StudentProfile;
  onRefreshData: () => void;
}

export const StudentOffers: React.FC<StudentOffersProps> = ({
  offers,
  student,
  onRefreshData,
}) => {
  const { showToast } = useToast();
  const [selectedOfferForPreview, setSelectedOfferForPreview] = useState<Offer | null>(null);

  const handleAccept = (offer: Offer) => {
    storageService.updateOfferStatus(offer.id, 'Accepted');
    showToast(`🎉 Congratulations! You have accepted the offer from ${offer.companyName}!`, 'success');
    onRefreshData();
  };

  const handleDecline = (offer: Offer) => {
    if (confirm(`Are you sure you want to decline the offer from ${offer.companyName}?`)) {
      storageService.updateOfferStatus(offer.id, 'Declined');
      showToast(`Offer from ${offer.companyName} has been declined.`, 'info');
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Placement Offers & Appointment Letters</h2>
          <p className="text-xs text-slate-500">
            Review formal compensation structures, employee stock allocations, and reporting dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {student.placed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Placed in Batch 2026
            </span>
          )}
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No official offers received yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Keep applying and preparing for scheduled assessment rounds. Successful interview rounds will result in offers generated here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {offers.map((offer) => {
            const isAccepted = offer.status === 'Accepted';
            const isDeclined = offer.status === 'Declined';
            const isPending = offer.status === 'Pending';

            return (
              <div
                key={offer.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden"
              >
                {/* Decorative border highlight */}
                {isAccepted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 p-2 flex items-center justify-center shrink-0">
                      {offer.companyLogo ? (
                        <img
                          src={offer.companyLogo}
                          alt={offer.companyName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{offer.companyName}</h3>
                        <span
                          className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDeclined
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">{offer.role}</p>
                      <p className="text-2xs text-slate-400 mt-1">
                        Issued Date: {formatDate(offer.issuedDate)} · Expected Joining: {formatDate(offer.joiningDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-2xs uppercase tracking-wider text-slate-400 font-semibold">
                      Annual Package (CTC)
                    </p>
                    <p className="text-2xl font-black font-mono text-emerald-600 tracking-tight">
                      {formatCurrency(offer.packageLpa)}
                    </p>
                    <p className="text-2xs text-slate-500 mt-0.5">Fixed + Variable + Benefits</p>
                  </div>
                </div>

                {/* Offer Letter Excerpt */}
                <div className="py-4">
                  <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed font-sans">
                    {offer.letterText}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setSelectedOfferForPreview(offer)}
                    className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View Formal Letterhead</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleDecline(offer)}
                          className="px-4 py-2 border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAccept(offer)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Offer</span>
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Offer Accepted & Verified by Placement Office
                      </span>
                    )}

                    {isDeclined && (
                      <span className="text-xs font-medium text-slate-500">
                        Declined by candidate
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formal Letterhead Modal */}
      {selectedOfferForPreview && (
        <Modal
          isOpen={!!selectedOfferForPreview}
          onClose={() => setSelectedOfferForPreview(null)}
          title={`Official Offer of Employment — ${selectedOfferForPreview.companyName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 p-6 bg-slate-50/50 border border-slate-200 rounded-xl font-sans">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedOfferForPreview.companyName}</h3>
                <p className="text-2xs text-slate-500">Global University Talent Acquisition Program</p>
              </div>
              <div className="text-right text-xs font-mono">
                <p className="text-slate-500">Ref: OFF/{selectedOfferForPreview.id.toUpperCase()}</p>
                <p className="text-slate-500">{formatDate(selectedOfferForPreview.issuedDate)}</p>
              </div>
            </div>

            <div className="text-xs text-slate-800 space-y-3 leading-relaxed">
              <p>
                To: <br />
                <strong>{student.name}</strong> ({student.registerNumber})<br />
                Department of {student.department}<br />
                Smart Campus Institute of Technology
              </p>

              <p>Dear {student.name},</p>

              <p>
                Following your outstanding performance in the campus recruitment evaluations, we are pleased to offer you the position of <strong>{selectedOfferForPreview.role}</strong> with an annual Cost to Company (CTC) of <strong>{formatCurrency(selectedOfferForPreview.packageLpa)}</strong>.
              </p>

              <p>
                Your anticipated joining date is <strong>{formatDate(selectedOfferForPreview.joiningDate)}</strong>, subject to the successful completion of your undergraduate degree without standing arrears.
              </p>

              <div className="p-3 bg-white border border-slate-200 rounded-lg text-2xs space-y-1">
                <p className="font-semibold text-slate-900">Compensation Breakdown Summary:</p>
                <p>• Basic Salary: 50% of annual CTC</p>
                <p>• Flexible Benefits & Allowances: 30% of annual CTC</p>
                <p>• Annual Performance Linked Incentive: 20% of annual CTC</p>
                <p>• Medical Insurance & Wellness Coverage: Included</p>
              </div>

              <p>
                Please confirm your acceptance of this appointment through the institutional portal.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-between items-end text-2xs text-slate-500">
              <div>
                <p className="font-bold text-slate-800">Authorized Signatory</p>
                <p>Corporate Talent Acquisition Directorate</p>
              </div>
              <button
                onClick={() => showToast('Offer letter PDF downloaded successfully', 'success')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
