import React from 'react';
import { Interview } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Calendar, Clock, Video, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useToast } from '../common/Toast';

interface StudentInterviewsProps {
  interviews: Interview[];
}

export const StudentInterviews: React.FC<StudentInterviewsProps> = ({ interviews }) => {
  const { showToast } = useToast();

  const handleJoinMeeting = (link: string, company: string) => {
    showToast(`Connecting to ${company} interview meeting room...`, 'info');
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Scheduled Interviews & Assessments</h2>
          <p className="text-xs text-slate-500">
            Virtual conference links, technical screening rounds, and reporting instructions.
          </p>
        </div>

        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
          {interviews.length} Scheduled Sessions
        </span>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No interviews currently scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Once a corporate recruiter shortlists your application, interview invitations and video links will be listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {interviews.map((int) => {
            const isCompleted = int.status === 'Completed';

            return (
              <div
                key={int.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {int.roundName}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{int.companyName}</h4>
                      <p className="text-xs text-slate-600 font-medium">{int.role}</p>
                    </div>

                    <span
                      className={`text-2xs px-2.5 py-1 rounded font-semibold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {int.status}
                    </span>
                  </div>

                  {/* Date & Time block */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-2xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Date
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">{formatDate(int.date)}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Time
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">{int.time}</p>
                    </div>
                  </div>

                  {/* Mode & Link info */}
                  <div className="text-xs space-y-1">
                    <p className="text-slate-600 flex items-center gap-1.5">
                      {int.mode === 'Online' ? (
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>
                        Mode: <strong>{int.mode}</strong>
                      </span>
                    </p>
                    {int.mode === 'Online' && int.locationOrLink && (
                      <p className="text-2xs font-mono text-slate-500 truncate">
                        Link: {int.locationOrLink}
                      </p>
                    )}
                  </div>

                  {int.feedback && (
                    <div className="p-2.5 rounded bg-emerald-50/70 border border-emerald-100 text-2xs text-emerald-900">
                      <strong>Panel Feedback:</strong> {int.feedback}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-2xs text-slate-400">
                    Mandatory: Keep camera ON with formal corporate attire
                  </span>
                  {!isCompleted && int.mode === 'Online' && int.locationOrLink && (
                    <button
                      onClick={() => handleJoinMeeting(int.locationOrLink, int.companyName)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
