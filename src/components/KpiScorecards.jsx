import React from 'react';
import { Calendar, Users, Moon, CalendarOff, ShieldCheck } from 'lucide-react';
import { DOCTORS } from '../data/doctors';

export default function KpiScorecards({ rosterData }) {
  const totalDays = rosterData.length;
  const activeDoctorsCount = DOCTORS.length;

  // Night shifts count (1st On-Call slots assigned)
  const nightShiftsCount = rosterData.filter((d) => d.call1).length;

  // Weekend days count
  const weekendDays = rosterData.filter((d) => d.isWeekend).length;

  // Average night shifts per doctor
  const avgNights = activeDoctorsCount ? (nightShiftsCount / activeDoctorsCount).toFixed(1) : 0;

  const scorecards = [
    {
      id: 'total-days',
      title: 'Total Roster Days',
      value: totalDays,
      unit: 'days scheduled',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      badge: 'Full Cycle',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'active-doctors',
      title: 'Active Medical Officers',
      value: activeDoctorsCount,
      unit: '6 Officers on rotation',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      badge: '100% Staffed',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'night-shifts',
      title: 'Night Shifts (1st On-Call)',
      value: nightShiftsCount,
      unit: `~${avgNights} nights / officer`,
      icon: Moon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      badge: 'Critical Lead',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'weekend-shifts',
      title: 'Weekend Roster Days',
      value: weekendDays,
      unit: `${rosterData.filter((d) => d.isWeekend && d.weekendOff).length} off-rotations`,
      icon: CalendarOff,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      badge: 'Protected Rest',
      badgeColor: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
      {scorecards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`relative overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-clinical hover:border-slate-300 transition-all duration-200 group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {card.value}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {card.unit}
                  </span>
                </div>
              </div>
              <div
                className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor} shadow-xs group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className={`font-semibold px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="text-slate-600 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Compliant
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
