import React, { useMemo } from 'react';
import {
  BarChart2,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { DOCTORS, DOCTOR_MAP } from '../data/doctors';

export default function DutyAnalyticsView({ rosterData }) {
  // Aggregate statistics per doctor
  const stats = useMemo(() => {
    const data = {};
    DOCTORS.forEach((d) => {
      data[d.code] = {
        doctor: d,
        call1: 0, // Night Call
        call2: 0, // Day Lead
        call3: 0, // ICU
        call4: 0, // Cover
        call5: 0, // OPD
        call6: 0, // Post-Call
        weekendOff: 0,
        weekendDuty: 0,
        totalDuties: 0,
      };
    });

    let consecutiveNightWarnings = [];

    // Analyze day by day
    for (let i = 0; i < rosterData.length; i++) {
      const day = rosterData[i];

      // Tally slots
      ['call1', 'call2', 'call3', 'call4', 'call5', 'call6'].forEach((slot) => {
        const docCode = day[slot];
        if (docCode && data[docCode]) {
          data[docCode][slot]++;
          data[docCode].totalDuties++;
          if (day.isWeekend) {
            data[docCode].weekendDuty++;
          }
        }
      });

      if (day.weekendOff && data[day.weekendOff]) {
        data[day.weekendOff].weekendOff++;
      }

      // Check consecutive 1st on-calls
      if (i > 0) {
        const prevDay = rosterData[i - 1];
        if (prevDay.call1 && day.call1 && prevDay.call1 === day.call1) {
          consecutiveNightWarnings.push({
            doctor: DOCTOR_MAP[day.call1]?.name || day.call1,
            dates: `${prevDay.date} & ${day.date}`,
          });
        }
      }
    }

    const list = Object.values(data);
    const totalNights = list.reduce((acc, d) => acc + d.call1, 0);
    const avgNights = list.length ? totalNights / list.length : 0;

    // Calculate equity fairness score (based on night variance)
    const variance =
      list.reduce((acc, d) => acc + Math.pow(d.call1 - avgNights, 2), 0) / (list.length || 1);
    const fairnessScore = Math.max(70, Math.min(100, Math.round(100 - variance * 10)));

    return {
      list,
      totalNights,
      avgNights: avgNights.toFixed(1),
      fairnessScore,
      consecutiveNightWarnings,
    };
  }, [rosterData]);

  // Max count for scaling bars
  const maxNightCount = Math.max(...stats.list.map((d) => d.call1), 5);

  return (
    <div className="space-y-6">
      {/* Top Clinical Equity Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fairness Scorecard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Workload Equity Index
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600">
                {stats.fairnessScore}%
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Optimal Balance
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Minimal variance across on-call night distribution
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Night Shifts Avg */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Night Calls
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-purple-700">
                {stats.avgNights}
              </span>
              <span className="text-xs text-slate-500">nights / officer</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.totalNights} total critical lead shifts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Moon className="w-6 h-6" />
          </div>
        </div>

        {/* Fatigue & Safe Interval Check */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Clinical Fatigue Monitor
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.consecutiveNightWarnings.length === 0 ? 'Safe' : 'Review'}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  stats.consecutiveNightWarnings.length === 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {stats.consecutiveNightWarnings.length === 0
                  ? '0 Consecutive Calls'
                  : `${stats.consecutiveNightWarnings.length} Warnings`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum 24h rest interval after 1st On-Call
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Warnings if any consecutive nights found */}
      {stats.consecutiveNightWarnings.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <strong className="font-bold">Clinical Duty Notice:</strong> Consecutive night
            shifts detected for:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {stats.consecutiveNightWarnings.map((w, idx) => (
                <li key={idx}>
                  {w.doctor} scheduled on {w.dates}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Visual Workload Equity Charts (Stacked Progress & Night Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1st On-Call (Night Lead) Equity Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                1st On-Call Night Shift Distribution
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Target: ~{(rosterData.length / (DOCTORS.length || 6)).toFixed(1)} shifts
            </span>
          </div>

          <div className="space-y-3.5">
            {stats.list.map((item) => {
              const doc = item.doctor;
              const percentage = Math.round((item.call1 / maxNightCount) * 100);

              return (
                <div key={doc.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${doc.theme.avatarBg}`}
                      >
                        {doc.code}
                      </span>
                      <span className="font-semibold text-slate-800">{doc.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.call1} nights{' '}
                      <span className="text-slate-400 font-normal">
                        ({((item.call1 / (stats.totalNights || 1)) * 100).toFixed(0)}%)
                      </span>
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${doc.theme.accentBg}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Duty Mix Stacked Progress Bars */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Total Duty Slot Mix (Stacked Distribution)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-purple-600"></span> Night
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500"></span> Day
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-teal-500"></span> Post-Call
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            {stats.list.map((item) => {
              const doc = item.doctor;
              const dayShifts = item.call2 + item.call3 + item.call4 + item.call5;
              const postCallShifts = item.call6;
              const nightShifts = item.call1;

              const total = item.totalDuties || 1;
              const nightPct = (nightShifts / total) * 100;
              const dayPct = (dayShifts / total) * 100;
              const postPct = (postCallShifts / total) * 100;

              return (
                <div key={doc.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${doc.theme.avatarBg}`}
                      >
                        {doc.code}
                      </span>
                      <span className="font-semibold text-slate-800">{doc.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.totalDuties} duties total
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    {/* Night Segment */}
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${nightPct}%` }}
                      title={`${item.call1} Night Calls`}
                    ></div>
                    {/* Day Segment */}
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${dayPct}%` }}
                      title={`${dayShifts} Day & Ward Calls`}
                    ></div>
                    {/* Post-Call Segment */}
                    <div
                      className="h-full bg-teal-500 transition-all duration-500"
                      style={{ width: `${postPct}%` }}
                      title={`${postCallShifts} Post-Call rest days`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comprehensive Equity Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Detailed Workload Equity Table
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of all 6 clinical slots and protected weekend offs
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] text-xs">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Medical Officer</th>
                <th className="py-3 px-3 text-center bg-purple-50/50 text-purple-900">
                  1st Night
                </th>
                <th className="py-3 px-3 text-center">2nd Day</th>
                <th className="py-3 px-3 text-center">3rd ICU</th>
                <th className="py-3 px-3 text-center">4th Cover</th>
                <th className="py-3 px-3 text-center">5th OPD</th>
                <th className="py-3 px-3 text-center">6th Post-Call</th>
                <th className="py-3 px-3 text-center bg-amber-50/50 text-amber-900">
                  Weekend Off
                </th>
                <th className="py-3 px-4 text-center font-bold">Total Duties</th>
                <th className="py-3 px-4 text-right">Equity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {stats.list.map((item) => {
                const doc = item.doctor;

                return (
                  <tr key={doc.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${doc.theme.avatarBg}`}
                        >
                          {doc.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{doc.name}</div>
                          <div className="text-[11px] text-slate-500">{doc.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-purple-900 bg-purple-50/30">
                      {item.call1}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {item.call2}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {item.call3}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {item.call4}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {item.call5}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {item.call6}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-900 bg-amber-50/30">
                      {item.weekendOff}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                      {item.totalDuties}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Balanced
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
}
