import React from 'react';
import { Plus, X, Filter } from 'lucide-react';
import { DOCTORS } from '../data/doctors';

export default function StaffLegendBar({
  selectedDoctor,
  setSelectedDoctor,
  onOpenAddModal,
  rosterData,
}) {
  // Compute total duties per doctor for the badge
  const doctorDutyCounts = React.useMemo(() => {
    const counts = {};
    DOCTORS.forEach((d) => {
      counts[d.code] = { total: 0, nights: 0 };
    });

    rosterData.forEach((day) => {
      ['call1', 'call2', 'call3', 'call4', 'call5', 'call6'].forEach((slot) => {
        const doc = day[slot];
        if (doc && counts[doc]) {
          counts[doc].total++;
          if (slot === 'call1') {
            counts[doc].nights++;
          }
        }
      });
    });
    return counts;
  }, [rosterData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        {/* Left side: Doctor Legend Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Staff Filter:</span>
          </div>

          {/* All Doctors Pill */}
          <button
            onClick={() => setSelectedDoctor(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
              selectedDoctor === null
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]'
                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>All Staff</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedDoctor === null
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {DOCTORS.length}
            </span>
          </button>

          {/* Doctor Specific Pills */}
          {DOCTORS.map((doc) => {
            const isSelected = selectedDoctor === doc.code;
            const isDimmed = selectedDoctor !== null && !isSelected;
            const stats = doctorDutyCounts[doc.code] || { total: 0, nights: 0 };

            return (
              <button
                key={doc.code}
                onClick={() => setSelectedDoctor(isSelected ? null : doc.code)}
                className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 select-none ${
                  doc.theme.badgeBg
                } ${doc.theme.badgeText} ${doc.theme.badgeBorder} ${
                  isSelected
                    ? `ring-2 ${doc.theme.ringColor} shadow-sm font-bold scale-[1.03]`
                    : `${doc.theme.badgeHover} cursor-pointer`
                } ${isDimmed ? 'opacity-40 grayscale-[30%]' : 'opacity-100'}`}
                title={`Filter by ${doc.name} • ${stats.nights} Night Shifts (${stats.total} Total)`}
              >
                {/* Doctor Initial Circle */}
                <span
                  className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                    doc.theme.avatarBg
                  }`}
                >
                  {doc.code}
                </span>

                <span className="font-semibold">{doc.name}</span>

                {/* Duty Counter pill */}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                    isSelected
                      ? 'bg-white/80 text-slate-900 shadow-2xs'
                      : 'bg-white/60 text-slate-600'
                  }`}
                >
                  {stats.nights}N / {stats.total}
                </span>
              </button>
            );
          })}

          {/* Active Filter Clear indicator */}
          {selectedDoctor && (
            <button
              onClick={() => setSelectedDoctor(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors font-medium ml-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* Right side: Add Day Schedule Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Day Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
