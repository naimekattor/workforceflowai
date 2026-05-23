import React from 'react';
import { FileText } from 'lucide-react';

export default function Activity() {
  const activities = [
    {
      id: 1,
      type: 'Invoice generated',
      title: 'Auto-generated invoice: INV-0001',
      author: 'System',
      date: 'Mar 2, 2026',
      time: '2:30 PM',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 2,
      type: 'Quote accepted',
      title: 'Quote Q-0001 accepted by Sarah Johnson',
      author: 'System',
      date: 'Mar 2, 2026',
      time: '2:30 PM',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 3,
      type: 'Quote sent',
      title: 'Sent quote: Q-0002',
      author: 'Demo Admin',
      date: 'Feb 28, 2026',
      time: '10:15 AM',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 4,
      type: 'Quote created',
      title: 'Created quote: Q-0003',
      author: 'Demo Admin',
      date: 'Mar 5, 2026',
      time: '9:00 AM',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 5,
      type: 'Quote created',
      title: 'Created quote: Q-0002',
      author: 'Demo Admin',
      date: 'Feb 28, 2026',
      time: '9:45 AM',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 6,
      type: 'Quote created',
      title: 'Created quote: Q-0001',
      author: 'Demo Admin',
      date: 'Feb 25, 2026',
      time: '11:20 AM',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Activity Log</h1>
        <p className="text-slate-500 text-sm">Track all system activities and changes</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 p-5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white"
            >
              <div className="mt-1">
                <FileText className="w-5 h-5 text-slate-400 fill-slate-100" />
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${activity.badgeColor}`}>
                    {activity.type}
                  </span>
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 mb-1">
                  {activity.title}
                </h3>
                <p className="text-[12px] text-slate-500">
                  {activity.author} • {activity.date} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
