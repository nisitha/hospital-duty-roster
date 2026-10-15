import React, { useState, useMemo } from 'react';
import {
  Moon,
  Sun,
  Activity,
  Shield,
  Stethoscope,
  Coffee,
  CalendarOff,
  Edit3,
  Trash2,
  Calendar,
  Search,
  Clock,
  Sparkles,
} from 'lucide-react';
import DoctorBadge from './DoctorBadge';
import { DOCTOR_MAP } from '../data/doctors';

export default function DailyCardsView({
  rosterData,
  selectedDoctor,
  onEditDay,
  onDeleteDay,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDays = useMemo(() => {
    return rosterData.filter((day) => {
      // Doctor filter
      if (selectedDoctor) {
        const hasDoctor =
          day.call1 === selectedDoctor ||
          day.call2 === selectedDoctor ||
          day.call3 === selectedDoctor ||
          day.call4 === selectedDoctor ||
          day.call5 === selectedDoctor ||
          day.call6 === selectedDoctor ||
          day.weekendOff === selectedDoctor;

        if (!hasDoctor) return false;
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const dateMatch = day.date.toLowerCase().includes(query);
        const dayMatch = day.dayOfWeek.toLowerCase().includes(query);
        const notesMatch = day.notes ? day.notes.toLowerCase().includes(query) : false;

        const doctorCodes = [
          day.call1,
          day.call2,
          day.call3,
          day.call4,
          day.call5,
          day.call6,
          day.weekendOff,
        ].filter(Boolean);

        const docMatch = doctorCodes.some((code) => {
          const doc = DOCTOR_MAP[code];
          return (
            code.toLowerCase() === query ||
            (doc && doc.name.toLowerCase().includes(query)) ||
            (doc && doc.shortName.toLowerCase().includes(query))
          );
        });

        if (!dateMatch && !dayMatch && !notesMatch && !docMatch) {
          return false;
        }
      }

      return true;
    });
  }, [rosterData, selectedDoctor, searchTerm]);

  const formatDateDisplay = (dateString) => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search daily cards by doctor or date..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-auto">
          Displaying <strong>{filteredDays.length}</strong> daily cards
        </div>
      </div>

      {/* Cards Grid */}
      {filteredDays.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No daily cards found</p>
          <p className="text-xs text-slate-400">Try adjusting your doctor filter or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDays.map((day) => {
            const isNightHighlight = selectedDoctor === day.call1;

            return (
              <div
                key={day.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-clinical flex flex-col overflow-hidden ${
                  day.isWeekend
                    ? 'border-amber-200/80 ring-1 ring-amber-100'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${
                    day.isWeekend
                      ? 'bg-amber-50/70 border-amber-200/60'
                      : 'bg-slate-50/90 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-2xs">
                      {day.date.split('-')[2]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {formatDateDisplay(day.date)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {day.dayOfWeek}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {day.isWeekend && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Weekend
                      </span>
                    )}
                    <button
                      onClick={() => onEditDay(day)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDay(day)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Night Critical Lead Banner (1st On-Call) */}
                <div className="p-3.5 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-purple-300">
                      <Moon className="w-4 h-4 fill-purple-300" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 block">
                        1st On-Call Night Lead
                      </span>
                      <span className="text-xs font-semibold text-white">
                        24-Hour Clinical Duty
                      </span>
                    </div>
                  </div>
                  <div>
                    <DoctorBadge
                      doctorCode={day.call1}
                      size="md"
                      isHighlighted={isNightHighlight}
                    />
                  </div>
                </div>

                {/* Secondary Duty Slots */}
                <div className="p-4 space-y-2.5 flex-1">
                  {/* Slot 2 & 3 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
                        <Sun className="w-3 h-3 text-amber-500" />
                        <span>2nd Day Lead</span>
                      </div>
                      <DoctorBadge
                        doctorCode={day.call2}
                        size="sm"
                        isHighlighted={selectedDoctor === day.call2}
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
                        <Activity className="w-3 h-3 text-sky-500" />
                        <span>3rd ICU / Ward</span>
                      </div>
                      <DoctorBadge
                        doctorCode={day.call3}
                        size="sm"
                        isHighlighted={selectedDoctor === day.call3}
                      />
                    </div>
                  </div>

                  {/* Slot 4 & 5 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span>4th Cover / Relief</span>
                      </div>
                      <DoctorBadge
                        doctorCode={day.call4}
                        size="sm"
                        isHighlighted={selectedDoctor === day.call4}
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
                        <Stethoscope className="w-3 h-3 text-indigo-500" />
                        <span>5th Day OPD</span>
                      </div>
                      <DoctorBadge
                        doctorCode={day.call5}
                        size="sm"
                        isHighlighted={selectedDoctor === day.call5}
                      />
                    </div>
                  </div>

                  {/* Slot 6 (Post-call) & Weekend Off */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
                        <Coffee className="w-3 h-3 text-teal-500" />
                        <span>6th Post-Call</span>
                      </div>
                      <DoctorBadge
                        doctorCode={day.call6}
                        size="sm"
                        isHighlighted={selectedDoctor === day.call6}
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 mb-1">
                        <CalendarOff className="w-3 h-3 text-amber-600" />
                        <span>Weekend Off</span>
                      </div>
                      {day.weekendOff ? (
                        <DoctorBadge
                          doctorCode={day.weekendOff}
                          size="sm"
                          isHighlighted={selectedDoctor === day.weekendOff}
                        />
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Notes if available */}
                  {day.notes && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5 italic">
                      <span className="font-semibold text-slate-600 not-italic">Note:</span>
                      <span className="truncate">{day.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
