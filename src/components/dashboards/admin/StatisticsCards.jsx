import React from 'react';

export default function StatisticsCard({ icon: Icon, name, value, change, color, textColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-br ${color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {change}
          </div>
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">{name}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`h-1 bg-gradient-to-r ${color}`}></div>
    </div>
  );
}

export function StatisticsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatisticsCard key={stat.name} {...stat} />
      ))}
    </div>
  );
}