import React from 'react';
import { NotificationItem, Announcement } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import { Bell, CheckCircle2, Clock, Megaphone, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface StudentNotificationsProps {
  notifications: NotificationItem[];
  announcements: Announcement[];
  studentUserId: string;
  onRefreshData: () => void;
}

export const StudentNotifications: React.FC<StudentNotificationsProps> = ({
  notifications,
  announcements,
  studentUserId,
  onRefreshData,
}) => {
  const { showToast } = useToast();

  const handleMarkRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    onRefreshData();
  };

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsAsRead(studentUserId);
    showToast('All notifications marked as read', 'success');
    onRefreshData();
  };

  const relevantNotifications = notifications.filter(
    (n) => n.userId === studentUserId || n.userId === 'all' || n.userId === 'students'
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Notifications & Broadcast Notices</h2>
          <p className="text-xs text-slate-500">
            Real-time updates on drive deadlines, test shortlists, and placement office circulars.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 text-indigo-600" />
          Mark all as read
        </button>
      </div>

      {/* Official Announcements */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-indigo-600" />
          Placement Directorate Circulars
        </h3>

        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-lg border ${
                ann.priority === 'urgent'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold">{ann.title}</h4>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded uppercase ${
                    ann.priority === 'urgent'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {ann.priority}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
              <p className="text-2xs text-slate-400 mt-2">
                Published by {ann.author} · {formatDate(ann.date)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Activity Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          Recent Activity & Application Alerts
        </h3>

        {relevantNotifications.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No alerts in your inbox.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {relevantNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`py-3 flex items-start justify-between gap-4 cursor-pointer transition-colors px-2 rounded-lg ${
                  !notif.read ? 'bg-indigo-50/40 font-medium' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <p className="text-2xs text-slate-400">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                    }}
                    className="text-2xs text-indigo-600 hover:text-indigo-800 shrink-0 font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
