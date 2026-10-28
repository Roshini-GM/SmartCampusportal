import React, { useState } from 'react';
import { StudentProfile, Company, PlacementDrive, Application, Offer } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../common/Toast';
import { Download, Printer, BarChart3, TrendingUp, Award, Users, CheckCircle2 } from 'lucide-react';

interface PlacementReportsProps {
  students: StudentProfile[];
  companies: Company[];
  drives: PlacementDrive[];
  applications: Application[];
  offers: Offer[];
}

export const PlacementReports: React.FC<PlacementReportsProps> = ({
  students,
  companies,
  drives,
  applications,
  offers,
}) => {
  const { showToast } = useToast();
  const [selectedYear, setSelectedYear] = useState('2025-2026');

  // Stats computation
  const totalStudents = students.length;
  const placedStudents = students.filter((s) => s.placed).length;
  const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  const packages = offers.map((o) => o.packageLpa);
  const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
  const averagePackage =
    packages.length > 0
      ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1))
      : 0;

  // Department breakdown
  const deptStats: {
    [dept: string]: {
      enrolled: number;
      placed: number;
      offers: number;
      avgCgpa: number;
      cgpaSum: number;
    };
  } = {};

  students.forEach((s) => {
    if (!deptStats[s.department]) {
      deptStats[s.department] = {
        enrolled: 0,
        placed: 0,
        offers: 0,
        avgCgpa: 0,
        cgpaSum: 0,
      };
    }
    deptStats[s.department].enrolled += 1;
    deptStats[s.department].cgpaSum += s.cgpa;
    if (s.placed) deptStats[s.department].placed += 1;
  });

  offers.forEach((o) => {
    const student = students.find((s) => s.id === o.studentId || s.name === o.studentName);
    if (student && deptStats[student.department]) {
      deptStats[student.department].offers += 1;
    }
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Register Number',
      'Student Name',
      'Department',
      'CGPA',
      'Active Backlogs',
      'Placed Status',
      'Company Name',
      'Role',
      'Package (LPA)',
    ];

    const rows = students.map((s) => {
      const studentOffer = offers.find((o) => o.studentId === s.id || o.studentName === s.name);
      return [
        `"${s.registerNumber}"`,
        `"${s.name}"`,
        `"${s.department}"`,
        s.cgpa.toFixed(2),
        s.backlogs,
        s.placed ? 'Placed' : 'Not Placed',
        studentOffer ? `"${studentOffer.companyName}"` : 'N/A',
        studentOffer ? `"${studentOffer.role}"` : 'N/A',
        studentOffer ? studentOffer.packageLpa : 'N/A',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Campus_Placement_Report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Placement statistical report exported as CSV!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Accreditation & Placement Analytics Report
          </h2>
          <p className="text-xs text-slate-500">
            Standard NBA / NAAC Criterion IV verified student career statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
          >
            <option value="2025-2026">Academic Year 2025–2026</option>
            <option value="2024-2025">Academic Year 2024–2025</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
          <p className="text-2xs uppercase tracking-wider text-slate-500 font-semibold">
            Overall Placement Rate
          </p>
          <p className="text-3xl font-extrabold font-mono text-emerald-600 mt-1">
            {placementRate}%
          </p>
          <p className="text-2xs text-slate-400 mt-1">
            {placedStudents} of {totalStudents} Placed
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
          <p className="text-2xs uppercase tracking-wider text-slate-500 font-semibold">
            Peak Compensation
          </p>
          <p className="text-3xl font-extrabold font-mono text-indigo-700 mt-1">
            ₹{highestPackage} LPA
          </p>
          <p className="text-2xs text-slate-400 mt-1">Microsoft India / Google Cloud</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
          <p className="text-2xs uppercase tracking-wider text-slate-500 font-semibold">
            Batch Average CTC
          </p>
          <p className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
            ₹{averagePackage} LPA
          </p>
          <p className="text-2xs text-slate-400 mt-1">Across All Engineering Disciplines</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center">
          <p className="text-2xs uppercase tracking-wider text-slate-500 font-semibold">
            Visiting Recruiters
          </p>
          <p className="text-3xl font-extrabold font-mono text-purple-700 mt-1">
            {companies.length}
          </p>
          <p className="text-2xs text-slate-400 mt-1">{drives.length} Drives Conducted</p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department-Wise Placement Statistics
            </h3>
            <p className="text-2xs text-slate-500">Official accreditation breakdown</p>
          </div>
          <span className="text-2xs text-slate-400">Class of 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-2xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Academic Department</th>
                <th className="py-3 px-4 text-center">Registered Students</th>
                <th className="py-3 px-4 text-center">Average CGPA</th>
                <th className="py-3 px-4 text-center">Placed Students</th>
                <th className="py-3 px-4 text-center">Total Offers</th>
                <th className="py-3 px-4 text-right">Placement Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(deptStats).map(([dept, data]) => {
                const avgCgpa = data.enrolled > 0 ? (data.cgpaSum / data.enrolled).toFixed(2) : '0';
                const rate =
                  data.enrolled > 0 ? Math.round((data.placed / data.enrolled) * 100) : 0;

                return (
                  <tr key={dept} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{dept}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {data.enrolled}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-indigo-700 font-semibold">
                      {avgCgpa}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900">
                      {data.placed}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {data.offers}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          rate >= 80
                            ? 'text-emerald-600'
                            : rate >= 60
                            ? 'text-indigo-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
