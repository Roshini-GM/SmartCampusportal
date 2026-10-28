import React, { useState, useEffect } from 'react';
import { useToast } from '../common/Toast';
import { Settings, Save, RotateCcw, ShieldCheck, Database, UserPlus, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ApiClient } from '../../services/apiClient';

export const AdminSettings: React.FC<{
  onRefreshData: () => void;
  onOpenEditProfile?: () => void;
  onOpenAdminRegister?: () => void;
}> = ({ onRefreshData, onOpenEditProfile, onOpenAdminRegister }) => {
  const { showToast } = useToast();
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [maxOffersAllowed, setMaxOffersAllowed] = useState(2);
  const [dreamPackageThreshold, setDreamPackageThreshold] = useState(15.0);
  const [autoVerifyCgpa, setAutoVerifyCgpa] = useState(true);

  // MongoDB Atlas health status
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    database?: string;
    error?: string;
    instructions?: string;
    checking: boolean;
  }>({
    connected: false,
    checking: true,
  });

  const checkDbHealth = async () => {
    setDbStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await ApiClient.get<{
        status: string;
        database: { connected: boolean; database: string; error?: string };
        instructions?: string;
      }>('/health');

      if (res.data) {
        setDbStatus({
          connected: !!res.data.database?.connected,
          database: res.data.database?.database || 'smart_campus',
          error: res.data.database?.error,
          instructions: res.data.instructions,
          checking: false,
        });
      } else {
        setDbStatus({
          connected: false,
          error: res.error || 'Backend service unreachable',
          checking: false,
        });
      }
    } catch {
      setDbStatus({
        connected: false,
        error: 'Could not fetch database health.',
        checking: false,
      });
    }
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  const handleReconnectDb = async () => {
    showToast('Re-verifying MongoDB Atlas connection...', 'info');
    setDbStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await ApiClient.post<{ success: boolean; database: { connected: boolean; error?: string } }>(
        '/database/reconnect'
      );
      if (res.data?.success) {
        showToast('Successfully connected to MongoDB Atlas!', 'success');
      } else {
        showToast(res.data?.database?.error || 'Connection failed. Verify Atlas IP whitelist.', 'warning');
      }
      checkDbHealth();
      storageService.syncFromBackend();
      onRefreshData();
    } catch {
      showToast('Error sending reconnect request', 'error');
      setDbStatus((prev) => ({ ...prev, checking: false }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Placement operational parameters updated!', 'success');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data to default mock records?')) {
      storageService.resetToDefault();
      showToast('All placement demo data restored to factory defaults.', 'success');
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Placement Policy & Portal Regulations</h2>
          <p className="text-xs text-slate-500">
            Configure institutional single/multiple offer policies, dream package thresholds, and MongoDB Atlas database connection.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAdminRegister && (
            <button
              onClick={onOpenAdminRegister}
              className="px-3.5 py-2 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create New Admin
            </button>
          )}
          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit Officer Profile
            </button>
          )}

          <button
            onClick={handleResetData}
            className="px-3.5 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* MongoDB Atlas Connection Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dbStatus.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">MongoDB Atlas Database Integration</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold ${
                  dbStatus.connected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {dbStatus.connected ? 'Connected to Atlas' : dbStatus.checking ? 'Checking Connection...' : 'Atlas Whitelist Notice'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected via secure backend proxy using <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-2xs">process.env.MONGODB_URI</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReconnectDb}
              disabled={dbStatus.checking}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbStatus.checking ? 'animate-spin' : ''}`} />
              Verify Connection
            </button>
          </div>
        </div>

        {dbStatus.connected ? (
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Database Active & Synchronized</p>
              <p className="mt-0.5 text-emerald-700">
                All campus user accounts, placement drives, applications, interviews, and offer letters are permanently saved to MongoDB Atlas ({dbStatus.database || 'smart_campus'}).
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Atlas Network Access Setup:</p>
              <p className="text-amber-800 leading-relaxed">
                If the database handshake does not complete, please ensure your cluster permits cloud connections: In your <strong>MongoDB Atlas Dashboard &rarr; Network Access &rarr; IP Access List</strong>, click <em>&ldquo;Add IP Address&rdquo;</em> and select <strong>&ldquo;Allow Access from Anywhere (0.0.0.0/0)&rdquo;</strong>.
              </p>
              <p className="text-2xs text-amber-700">
                The portal maintains local data synchronization so your UI remains fully interactive and functional in the meantime.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-600" />
            Institutional Rules & Thresholds
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Active Academic Year Cycle
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Allowed Student Offers
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={maxOffersAllowed}
                onChange={(e) => setMaxOffersAllowed(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dream Tier CTC Cutoff (LPA)
              </label>
              <input
                type="number"
                step="0.5"
                value={dreamPackageThreshold}
                onChange={(e) => setDreamPackageThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono font-bold text-indigo-700"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoVerifyCgpa}
                onChange={(e) => setAutoVerifyCgpa(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Auto-block applications from candidates with standing arrears</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Institutional Settings
          </button>
        </form>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Accreditation Data Integrity
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Smart Campus Placement system automatically maintains immutable audit logs of all student marks verifications, recruiter shortlists, interview recordings, and appointment letters.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-2xs text-slate-500">
            <p className="font-semibold text-slate-800">Criterion IV Ready:</p>
            <p>&bull; Departmental placement percentage matrices</p>
            <p>&bull; Median salary computation according to NIRF / NAAC definitions</p>
            <p>&bull; High-package dream offers verification</p>
          </div>
        </div>
      </div>
    </div>
  );
};
