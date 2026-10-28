import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import { useToast } from '../common/Toast';
import { Settings, Lock, Bell, Shield, Save } from 'lucide-react';

interface StudentSettingsProps {
  student: StudentProfile;
  onOpenEditProfile?: () => void;
}

export const StudentSettings: React.FC<StudentSettingsProps> = ({ student, onOpenEditProfile }) => {
  const { showToast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [passwordState, setPasswordState] = useState({ current: '', next: '', confirm: '' });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.current || !passwordState.next) {
      showToast('Please fill out password fields', 'warning');
      return;
    }
    if (passwordState.next !== passwordState.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Portal password updated securely!', 'success');
    setPasswordState({ current: '', next: '', confirm: '' });
  };

  const handleSavePreferences = () => {
    showToast('Notification preferences saved', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Account & Portal Settings</h2>
          <p className="text-xs text-slate-500">
            Manage your verified identity, credentials, communication channels, and security preferences.
          </p>
        </div>

        {onOpenEditProfile && (
          <button
            onClick={onOpenEditProfile}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            Edit Profile Details
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password Form */}
        <form
          onSubmit={handlePasswordChange}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            Security & Password Change
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordState.current}
              onChange={(e) => setPasswordState({ ...passwordState, current: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordState.next}
              onChange={(e) => setPasswordState({ ...passwordState, next: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordState.confirm}
              onChange={(e) => setPasswordState({ ...passwordState, confirm: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Update Password
          </button>
        </form>

        {/* Notifications & Privacy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            Broadcast & Alert Preferences
          </h3>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-900">Email Alerts on New Drives</p>
                <p className="text-2xs text-slate-500">
                  Receive instant dispatch when a company opens registration for your department.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-900">SMS / WhatsApp Shortlist Alerts</p>
                <p className="text-2xs text-slate-500">
                  Receive priority mobile text alerts when scheduled for interview rounds.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
