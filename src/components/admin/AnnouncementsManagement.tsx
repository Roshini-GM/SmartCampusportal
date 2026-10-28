import React, { useState } from 'react';
import { Announcement } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import { formatDate } from '../../utils/formatters';
import { Megaphone, Plus, Send, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';

interface AnnouncementsManagementProps {
  announcements: Announcement[];
  onRefreshData: () => void;
}

export const AnnouncementsManagement: React.FC<AnnouncementsManagementProps> = ({
  announcements,
  onRefreshData,
}) => {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'all' as 'all' | 'students' | 'recruiters',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
    author: 'Placement Directorate',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showToast('Please enter title and content', 'warning');
      return;
    }

    storageService.addAnnouncement({
      title: formData.title,
      content: formData.content,
      targetRole: formData.targetRole,
      priority: formData.priority,
      author: formData.author,
    });

    showToast('Placement notice broadcasted successfully!', 'success');
    setShowModal(false);
    setFormData({
      title: '',
      content: '',
      targetRole: 'all',
      priority: 'normal',
      author: 'Placement Directorate',
    });
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Placement Notices & Announcements</h2>
          <p className="text-xs text-slate-500">
            Publish official guidelines, code of conduct, and schedule updates to students & recruiters.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Broadcast Notice
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-xl border bg-white shadow-xs space-y-2 ${
              ann.priority === 'urgent'
                ? 'border-l-4 border-l-rose-500 border-slate-200'
                : ann.priority === 'high'
                ? 'border-l-4 border-l-amber-500 border-slate-200'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded uppercase ${
                    ann.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : ann.priority === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ann.priority} Priority · Target: {ann.targetRole}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{ann.title}</h3>
              </div>

              <span className="text-2xs text-slate-400 font-mono shrink-0">
                {formatDate(ann.date)}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
              <span>Author: {ann.author}</span>
              <span className="text-emerald-700 font-semibold">Active Circular</span>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Publish Official Placement Circular"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mandatory Briefing for Google Cloud Drive"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="all">All Portal Users</option>
                  <option value="students">Students Only</option>
                  <option value="recruiters">Recruiters Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Importance</option>
                  <option value="urgent">Urgent Circular</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Content *
              </label>
              <textarea
                rows={4}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Draft clear guidelines, requirements, schedule details..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast to Portal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
