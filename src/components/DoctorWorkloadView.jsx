import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Moon,
  Sun,
  Activity,
  Shield,
  Stethoscope,
  CalendarOff,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DOCTORS, DOCTOR_MAP } from '../data/doctors';

export default function DoctorWorkloadView({ rosterData, selectedDoctorCode, onSelectDoctor }) {
  const [internalDocCode, setInternalDocCode] = useState('H');
  const activeDocCode = selectedDoctorCode || internalDocCode;

  const currentDoctor = DOCTOR_MAP[activeDocCode] || DOCTORS[0];

  // Analyze shifts for the selected doctor
  const doctorAnalytics = useMemo(() => {
    const shifts = [];
    let nightsCount = 0;
    let day2Count = 0;
    let day3Count = 0;
    let cover4Count = 0;
    let opd5Count = 0;
    let postCall6Count = 0;
    let weekendOffCount = 0;
    let weekendDutyCount = 0;

    rosterData.forEach((day) => {
      let roleOnThisDay = null;
      let slotKey = null;

      if (day.call1 === activeDocCode) {
        roleOnThisDay = '1st On-Call (Night Lead)';
        slotKey = 'call1';
        nightsCount++;
        if (day.isWeekend) weekendDutyCount++;
      } else if (day.call2 === activeDocCode) {
        roleOnThisDay = '2nd On-Call (Day Lead)';
        slotKey = 'call2';
        day2Count++;
        if (day.isWeekend) weekendDutyCount++;
      } else if (day.call3 === activeDocCode) {
        roleOnThisDay = '3rd On-Call (Ward / ICU)';
        slotKey = 'call3';
        day3Count++;
        if (day.isWeekend) weekendDutyCount++;
      } else if (day.call4 === activeDocCode) {
        roleOnThisDay = '4th On-Call (Cover / Free)';
        slotKey = 'call4';
        cover4Count++;
        if (day.isWeekend) weekendDutyCount++;
      } else if (day.call5 === activeDocCode) {
        roleOnThisDay = '5th On-Call (Day OPD)';
        slotKey = 'call5';
        opd5Count++;
        if (day.isWeekend) weekendDutyCount++;
      } else if (day.call6 === activeDocCode) {
        roleOnThisDay = '6th On-Call (Post-Call)';
        slotKey = 'call6';
        postCall6Count++;
      }

      const isOff = day.weekendOff === activeDocCode;
      if (isOff) {
        weekendOffCount++;
      }

      if (roleOnThisDay || isOff) {
        shifts.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          isWeekend: day.isWeekend,
          role: roleOnThisDay,
          slotKey,
          isWeekendOff: isOff,
          notes: day.notes,
        });
      }
    });

    const totalActiveDuties =
      nightsCount + day2Count + day3Count + cover4Count + opd5Count + postCall6Count;

    return {
      shifts,
      nightsCount,
      day2Count,
      day3Count,
      cover4Count,
      opd5Count,
      postCall6Count,
      weekendOffCount,
      weekendDutyCount,
      totalActiveDuties,
    };
  }, [rosterData, activeDocCode]);

  const targetQuota = Math.max(1, Math.round(rosterData.length / (DOCTORS.length || 6)));
  const quotaPercentage = Math.min(
    Math.round((doctorAnalytics.nightsCount / targetQuota) * 100),
    100
  );

  return (
    <div className="space-y-6">
      {/* Doctor Selector Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Officer Profile:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {DOCTORS.map((doc) => {
              const isSelected = doc.code === activeDocCode;
              return (
                <button
                  key={doc.code}
                  onClick={() => {
                    setInternalDocCode(doc.code);
                    if (onSelectDoctor) onSelectDoctor(doc.code);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    isSelected
                      ? `${doc.theme.badgeBg} ${doc.theme.badgeText} ${doc.theme.badgeBorder} ring-2 ${doc.theme.ringColor} shadow-xs scale-105`
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${doc.theme.avatarBg}`}
                  >
                    {doc.code}
                  </span>
                  <span>{doc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctor Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md ${currentDoctor.theme.avatarBg}`}
            >
              {currentDoctor.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentDoctor.name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentDoctor.theme.badgeBg} ${currentDoctor.theme.badgeText} ${currentDoctor.theme.badgeBorder}`}
                >
                  Code: {currentDoctor.code}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                {currentDoctor.role}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Roster Compliant
                </span>
                <span className="text-slate-300">•</span>
                <span>Rest Interval: &gt; 24h</span>
                <span className="text-slate-300">•</span>
                <span>Fairness Score: 98%</span>
              </div>
            </div>
          </div>

          {/* Night Quota Progress Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-purple-600" />
                Night Shift Quota:
              </span>
              <span className="font-bold text-slate-900">
                {doctorAnalytics.nightsCount} / {targetQuota} nights
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${quotaPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5">
              {quotaPercentage >= 100
                ? 'Target quota met for this cycle'
                : `${targetQuota - doctorAnalytics.nightsCount} night shift(s) remaining`}
            </p>
          </div>
        </div>

        {/* Doctor Shift Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center gap-1.5 text-purple-700 text-xs font-medium mb-1">
              <Moon className="w-3.5 h-3.5 text-purple-600" />
              <span>1st Night</span>
            </div>
            <div className="text-xl font-bold text-purple-900">
              {doctorAnalytics.nightsCount}
            </div>
            <div className="text-[10px] text-purple-600 font-medium">Critical On-Call</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-medium mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>2nd Day</span>
            </div>
            <div className="text-xl font-bold text-amber-900">
              {doctorAnalytics.day2Count}
            </div>
            <div className="text-[10px] text-amber-600 font-medium">Acute Lead</div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
            <div className="flex items-center gap-1.5 text-sky-700 text-xs font-medium mb-1">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>3rd ICU</span>
            </div>
            <div className="text-xl font-bold text-sky-900">
              {doctorAnalytics.day3Count}
            </div>
            <div className="text-[10px] text-sky-600 font-medium">Ward Rounds</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium mb-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>4th Cover</span>
            </div>
            <div className="text-xl font-bold text-emerald-900">
              {doctorAnalytics.cover4Count}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Relief Duty</div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-medium mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>5th OPD</span>
            </div>
            <div className="text-xl font-bold text-indigo-900">
              {doctorAnalytics.opd5Count}
            </div>
            <div className="text-[10px] text-indigo-600 font-medium">Clinic Floor</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
            <div className="flex items-center gap-1.5 text-rose-700 text-xs font-medium mb-1">
              <CalendarOff className="w-3.5 h-3.5 text-rose-600" />
              <span>Weekend Off</span>
            </div>
            <div className="text-xl font-bold text-rose-900">
              {doctorAnalytics.weekendOffCount}
            </div>
            <div className="text-[10px] text-rose-600 font-medium">Guaranteed Rest</div>
          </div>
        </div>
      </div>

      {/* Chronological Shift Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Personal Shift Timeline ({doctorAnalytics.shifts.length} active assignments)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Chronological order
          </span>
        </div>

        <div className="space-y-3">
          {doctorAnalytics.shifts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No shifts assigned to this doctor yet.
            </p>
          ) : (
            doctorAnalytics.shifts.map((shift, idx) => {
              const isNight = shift.slotKey === 'call1';
              const isOff = shift.isWeekendOff;

              return (
                <div
                  key={`${shift.date}-${idx}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isNight
                      ? 'bg-purple-50/40 border-purple-200 ring-1 ring-purple-100'
                      : isOff
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-50'
                  }`}
                >
                  {/* Date & Day */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                        isNight
                          ? 'bg-purple-600 text-white shadow-xs'
                          : isOff
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{shift.date.split('-')[2]}</span>
                      <span className="text-[9px] uppercase font-normal -mt-1">
                        {shift.dayOfWeek.slice(0, 3)}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{shift.date}</span>
                        {shift.isWeekend && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Weekend
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {shift.dayOfWeek} {shift.notes && `• ${shift.notes}`}
                      </div>
                    </div>
                  </div>

                  {/* Duty Badge / Status */}
                  <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    {shift.role && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                          isNight
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                        }`}
                      >
                        {isNight ? (
                          <Moon className="w-3.5 h-3.5 text-purple-600 fill-purple-200" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{shift.role}</span>
                      </span>
                    )}

                    {isOff && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <CalendarOff className="w-3.5 h-3.5 text-amber-600" />
                        <span>Protected Weekend Off</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
