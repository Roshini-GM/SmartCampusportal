import React, { useState } from 'react';
import { Interview, Application, StudentProfile } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Calendar, Plus, Clock, Video, MapPin, CheckCircle, ExternalLink } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminInterviewsProps {
  interviews: Interview[];
  applications: Application[];
  students: StudentProfile[];
  onRefreshData: () => void;
  presetAppForScheduling?: Application | null;
  onClearPresetApp?: () => void;
}

export const AdminInterviews: React.FC<AdminInterviewsProps> = ({
  interviews,
  applications,
  students,
  onRefreshData,
  presetAppForScheduling,
  onClearPresetApp,
}) => {
  const { showToast } = useToast();
  const [showScheduleModal, setShowScheduleModal] = useState(!!presetAppForScheduling);

  const [selectedAppId, setSelectedAppId] = useState(
    presetAppForScheduling ? presetAppForScheduling.id : applications[0]?.id || ''
  );
  const [roundName, setRoundName] = useState('Technical Screening (Data Structures)');
  const [date, setDate] = useState('2026-10-12');
  const [time, setTime] = useState('11:00 AM IST');
  const [mode, setMode] = useState<'Online' | 'In-Person' | 'Telephonic'>('Online');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/campus-interview');

  // Feedback modal
  const [completingInterview, setCompletingInterview] = useState<Interview | null>(null);
  const [feedbackText, setFeedbackText] = useState('Recommended for final offer.');

  const handleOpenScheduleModal = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find((a) => a.id === selectedAppId);
    if (!app) {
      showToast('Please select a student application', 'warning');
      return;
    }

    storageService.scheduleInterview({
      applicationId: app.id,
      studentId: app.studentId,
      studentName: app.studentName,
      studentRegNo: app.studentRegNo,
      companyName: app.companyName,
      role: app.role,
      roundName,
      date,
      time,
      mode,
      locationOrLink: meetingLink,
      status: 'Scheduled',
    });

    showToast(`Interview scheduled for ${app.studentName} with ${app.companyName}!`, 'success');
    setShowScheduleModal(false);
    if (onClearPresetApp) onClearPresetApp();
    onRefreshData();
  };

  const handleMarkCompleted = () => {
    if (!completingInterview) return;

    storageService.updateInterview({
      ...completingInterview,
      status: 'Completed',
      feedback: feedbackText,
    });

    showToast(`Interview for ${completingInterview.studentName} marked Completed!`, 'success');
    setCompletingInterview(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Interviews & Evaluation Schedules</h2>
          <p className="text-xs text-slate-500">
            Coordinate virtual video interviews, in-person panels, and panel feedback.
          </p>
        </div>

        <button
          onClick={handleOpenScheduleModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Schedule New Interview
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No interviews currently on calendar</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Select a candidate from the shortlisted pool to create an interview session.
          </p>
          <button
            onClick={handleOpenScheduleModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Schedule First Interview
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-2xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate & Roll</th>
                  <th className="py-3 px-4">Recruiter & Role</th>
                  <th className="py-3 px-4">Round Name</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Mode / Link</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.map((int) => {
                  const isDone = int.status === 'Completed';

                  return (
                    <tr key={int.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{int.studentName}</p>
                        <p className="text-2xs text-slate-400 font-mono">{int.studentRegNo || 'Student'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{int.companyName}</p>
                        <p className="text-2xs text-slate-600">{int.role}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{int.roundName}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{formatDate(int.date)}</p>
                        <p className="text-2xs text-slate-500">{int.time}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block">{int.mode}</span>
                        {int.locationOrLink && (
                          <a
                            href={int.locationOrLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-2xs text-indigo-600 hover:underline truncate max-w-[140px] block"
                          >
                            {int.locationOrLink}
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {int.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isDone && (
                          <button
                            onClick={() => setCompletingInterview(int)}
                            className="px-2.5 py-1 text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                        {isDone && int.feedback && (
                          <span className="text-2xs text-slate-500 italic truncate max-w-[120px] block text-right">
                            “{int.feedback}”
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            if (onClearPresetApp) onClearPresetApp();
          }}
          title="Schedule Campus Interview"
          subtitle="Generate calendar slot, conference room link, and notify student"
          maxWidth="md"
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Candidate Application *
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.studentName} ({app.studentRegNo}) — {app.companyName} [{app.role}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Round Specification *
              </label>
              <input
                type="text"
                required
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="e.g. Technical Round 1 (Algorithms)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot *</label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 10:30 AM IST"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="Online">Online Video (Google Meet / Teams)</option>
                  <option value="In-Person">In-Person (Placement Hub Booth)</option>
                  <option value="Telephonic">Telephonic Assessment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Meeting URL
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Confirm & Dispatch Invitation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mark Completed Modal */}
      {completingInterview && (
        <Modal
          isOpen={!!completingInterview}
          onClose={() => setCompletingInterview(null)}
          title="Interview Completion & Evaluation"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Record interview outcome and panel feedback for{' '}
              <strong>{completingInterview.studentName}</strong> (
              {completingInterview.companyName} · {completingInterview.roundName}).
            </p>

            <div>
              <label className="block text-2xs font-bold uppercase text-slate-600 mb-1">
                Panel Remarks / Verdict
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCompletingInterview(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded font-semibold"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
