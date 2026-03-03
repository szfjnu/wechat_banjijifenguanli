// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { ArrowUp, ArrowDown } from 'lucide-react';

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'blue',
  className = ''
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    amber: 'bg-amber-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white'
  };
  const bgColorClasses = {
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50'
  };
  return <div className={`bg-white rounded-lg shadow-sm p-2.5 transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between mb-1">
        <div className={`w-9 h-9 rounded-lg ${colorClasses[color]} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4.5 h-4.5" strokeWidth={2} />
        </div>
        {trend && <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>}
      </div>
      
      <div className="mb-0.5">
        <p className="text-lg font-bold text-gray-900 font-mono tracking-tight">{value}</p>
      </div>
      
      <div className="space-y-0">
        <p className="text-xs text-gray-700 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>;
}
export default StatCard;