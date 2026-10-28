import React, { useState } from 'react';
import {
  StudentProfile,
  Company,
  PlacementDrive,
  Application,
  Interview,
  Offer,
  Announcement,
} from '../../types';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  Award,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { CreateDriveModal } from './CreateDriveModal';

interface AdminDashboardProps {
  students: StudentProfile[];
  companies: Company[];
  drives: PlacementDrive[];
  applications: Application[];
  interviews: Interview[];
  offers: Offer[];
  announcements: Announcement[];
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  companies,
  drives,
  applications,
  interviews,
  offers,
  announcements,
  onNavigateTab,
  onRefreshData,
}) => {
  const [showCreateDrive, setShowCreateDrive] = useState(false);

  // Core metrics
  const totalStudents = students.length;
  const placedStudents = students.filter((s) => s.placed).length;
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
  const activeDrives = drives.filter((d) => d.status === 'active').length;
  const totalApplications = applications.length;

  // Department-wise placements
  const deptMap: { [key: string]: { total: number; placed: number } } = {};
  students.forEach((s) => {
    if (!deptMap[s.department]) {
      deptMap[s.department] = { total: 0, placed: 0 };
    }
    deptMap[s.department].total += 1;
    if (s.placed) deptMap[s.department].placed += 1;
  });

  // Company selections map
  const compSelections: { [key: string]: number } = {};
  offers.forEach((o) => {
    compSelections[o.companyName] = (compSelections[o.companyName] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-2xs font-medium border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Training & Placement Directorate Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Institutional Placement Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Real-time monitoring of campus recruitment operations, company drives, student qualifications, and hiring conversions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateDrive(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Placement Drive
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Students"
          value={totalStudents}
          subtitle="Registered Batch"
          icon={<Users className="w-5 h-5" />}
          onClick={() => onNavigateTab('students')}
        />
        <StatCard
          label="Partner Companies"
          value={companies.length}
          subtitle="Corporate Network"
          icon={<Building2 className="w-5 h-5" />}
          onClick={() => onNavigateTab('companies')}
        />
        <StatCard
          label="Active Drives"
          value={activeDrives}
          subtitle="Open for Registrations"
          icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
          onClick={() => onNavigateTab('drives')}
        />
        <StatCard
          label="Applications"
          value={totalApplications}
          subtitle="Processed"
          icon={<FileCheck2 className="w-5 h-5 text-purple-600" />}
          onClick={() => onNavigateTab('applications')}
        />
        <StatCard
          label="Students Placed"
          value={placedStudents}
          subtitle="Offers Verified"
          icon={<Award className="w-5 h-5 text-emerald-600" />}
          trend={`${placementRate}% rate`}
          trendPositive
          onClick={() => onNavigateTab('results')}
        />
        <StatCard
          label="Placement %"
          value={`${placementRate}%`}
          subtitle="Batch Metric"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          onClick={() => onNavigateTab('reports')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department-wise Placements Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department-Wise Placement Distribution
              </h3>
              <p className="text-2xs text-slate-500">
                Number of candidates placed against total registered batch per department
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-2xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Full Analytics →
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {Object.entries(deptMap).map(([dept, data]) => {
              const pct = data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0;

              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept}</span>
                    <span className="text-slate-500 font-mono text-2xs">
                      <strong className="text-slate-900">{data.placed}</strong> / {data.total} placed ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company-wise Selections & Recent Activity */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Hiring Organizations</h3>
            <p className="text-2xs text-slate-500">Selections confirmed by partner corporate panels</p>
          </div>

          <div className="space-y-2.5">
            {Object.entries(compSelections).map(([comp, count]) => (
              <div
                key={comp}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800">{comp}</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  {count} Selections
                </span>
              </div>
            ))}
          </div>

          {/* Quick Notice Banner */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
            <p className="text-xs font-bold text-indigo-950">Active Phase-1 Placement Drive Schedule</p>
            <p className="text-2xs text-indigo-800">
              Tier-1 software, cloud infrastructure, and core mechanical engineering firms are currently conducting online tests.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Recent Applications & Quick Administrative Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Applications table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Latest Candidate Applications</h3>
              <p className="text-2xs text-slate-500">Recent student submissions across active drives</p>
            </div>
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View All ({applications.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-2xs uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">CGPA</th>
                  <th className="py-2.5 px-3">Company & Role</th>
                  <th className="py-2.5 px-3">Package</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-900">{app.studentName}</p>
                      <p className="text-2xs text-slate-400 font-mono">{app.studentRegNo}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{app.studentDept}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-700">
                      {app.studentCgpa.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-800">{app.companyName}</p>
                      <p className="text-2xs text-slate-500">{app.role}</p>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {formatCurrency(app.packageLpa)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & Upcoming Drives */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Placement Cell Quick Actions</h3>
            <p className="text-2xs text-slate-500">Shortcut administrative operations</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowCreateDrive(true)}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">Launch New Drive</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('interviews')}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Schedule Interview Slots ({interviews.length})
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('announcements')}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Publish Circulars ({announcements.length})
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">
                  Download NBA/NAAC Report
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Drive Modal */}
      <CreateDriveModal
        isOpen={showCreateDrive}
        onClose={() => setShowCreateDrive(false)}
        companies={companies}
        onCreated={() => {
          onRefreshData();
        }}
      />
    </div>
  );
};
