import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  trend?: string;
  trendPositive?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  badge,
  trend,
  trendPositive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-indigo-50/80 text-indigo-600 border border-indigo-100">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || badge || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {badge && (
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-2xs font-medium">
              {badge}
            </span>
          )}
          {trend && (
            <span
              className={`font-medium ${
                trendPositive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
