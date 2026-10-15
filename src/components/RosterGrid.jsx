import React, { useState, useMemo } from 'react';
import {
  Search,
  Moon,
  Sun,
  Activity,
  Shield,
  Stethoscope,
  Coffee,
  CalendarOff,
  Edit3,
  Trash2,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';
import DoctorBadge from './DoctorBadge';
import { DOCTOR_MAP } from '../data/doctors';

export default function RosterGrid({
  rosterData,
  selectedDoctor,
  onEditDay,
  onDeleteDay,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dayTypeFilter, setDayTypeFilter] = useState('all'); // 'all' | 'weekdays' | 'weekends'

  // Filtered roster data based on search and filters
  const filteredData = useMemo(() => {
    return rosterData.filter((day) => {
      // Day type filter
      if (dayTypeFilter === 'weekdays' && day.isWeekend) return false;
      if (dayTypeFilter === 'weekends' && !day.isWeekend) return false;

      // Doctor filter from StaffLegendBar
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

        // Check doctor names matching
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
  }, [rosterData, dayTypeFilter, selectedDoctor, searchTerm]);

  // Helper date formatter
  const formatDateDisplay = (dateString) => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor, date (e.g. Oct 14), or ward..."
            className="w-full pl-9 pr-4 py-2 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
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

        {/* Day Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setDayTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dayTypeFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Days ({rosterData.length})
          </button>
          <button
            onClick={() => setDayTypeFilter('weekdays')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dayTypeFilter === 'weekdays'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekdays Only ({rosterData.filter((d) => !d.isWeekend).length})
          </button>
          <button
            onClick={() => setDayTypeFilter('weekends')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dayTypeFilter === 'weekends'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekends Only ({rosterData.filter((d) => d.isWeekend).length})
          </button>
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200/90">
              <th className="py-3.5 px-4 w-44">Date & Day</th>
              <th className="py-3.5 px-3 bg-purple-50/50 text-purple-900 border-x border-purple-100/80">
                <div className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-purple-600 fill-purple-100" />
                  <span>1st On-Call (Night)</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>2nd On-Call</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  <span>3rd (ICU/Ward)</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>4th (Cover/Free)</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
                  <span>5th (Day OPD)</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-teal-500" />
                  <span>6th (Post-Call)</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-slate-700 bg-amber-50/30">
                <div className="flex items-center gap-1.5">
                  <CalendarOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Weekend Off</span>
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 text-xs sm:text-sm">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="w-8 h-8 text-slate-300" />
                    <p className="font-medium text-slate-600">No roster days match your filters</p>
                    <p className="text-xs text-slate-400">Try clearing your search term or doctor filter</p>
                    {(searchTerm || selectedDoctor || dayTypeFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setDayTypeFilter('all');
                        }}
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((day) => {
                const isSelectedWeekend = day.isWeekend;

                return (
                  <tr
                    key={day.id}
                    className={`transition-colors duration-150 group hover:bg-slate-50/90 ${
                      isSelectedWeekend
                        ? 'bg-amber-50/35 border-l-4 border-l-amber-400/90'
                        : 'bg-white'
                    }`}
                  >
                    {/* Date & Day */}
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{formatDateDisplay(day.date)}</span>
                            {day.isWeekend && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                W/E
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                            <span>{day.dayOfWeek}</span>
                            {day.notes && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span
                                  className="truncate max-w-[140px] text-slate-400 italic text-[10px]"
                                  title={day.notes}
                                >
                                  {day.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 1st On-Call (Night Lead) */}
                    <td className="py-3 px-3 bg-purple-50/20 border-x border-purple-100/50">
                      <DoctorBadge
                        doctorCode={day.call1}
                        size="md"
                        isHighlighted={selectedDoctor === day.call1}
                        isDimmed={selectedDoctor && selectedDoctor !== day.call1}
                      />
                    </td>

                    {/* 2nd On-Call */}
                    <td className="py-3 px-3">
                      <DoctorBadge
                        doctorCode={day.call2}
                        size="md"
                        isHighlighted={selectedDoctor === day.call2}
                        isDimmed={selectedDoctor && selectedDoctor !== day.call2}
                      />
                    </td>

                    {/* 3rd On-Call */}
                    <td className="py-3 px-3">
                      <DoctorBadge
                        doctorCode={day.call3}
                        size="md"
                        isHighlighted={selectedDoctor === day.call3}
                        isDimmed={selectedDoctor && selectedDoctor !== day.call3}
                      />
                    </td>

                    {/* 4th On-Call (Cover) */}
                    <td className="py-3 px-3">
                      <DoctorBadge
                        doctorCode={day.call4}
                        size="md"
                        isHighlighted={selectedDoctor === day.call4}
                        isDimmed={selectedDoctor && selectedDoctor !== day.call4}
                      />
                    </td>

                    {/* 5th On-Call (OPD) */}
                    <td className="py-3 px-3">
                      <DoctorBadge
                        doctorCode={day.call5}
                        size="md"
                        isHighlighted={selectedDoctor === day.call5}
                        isDimmed={selectedDoctor && selectedDoctor !== day.call5}
                      />
                    </td>

                    {/* 6th On-Call (Post-Call) */}
                    <td className="py-3 px-3">
                      <DoctorBadge
                        doctorCode={day.call6}
                        size="md"
                        isHighlighted={selectedDoctor === day.call6}
                        isDimmed={selectedDoctor && selectedDoctor !== day.call6}
                      />
                    </td>

                    {/* Weekend Off */}
                    <td className="py-3 px-3 bg-amber-50/20">
                      {day.weekendOff ? (
                        <DoctorBadge
                          doctorCode={day.weekendOff}
                          size="md"
                          isHighlighted={selectedDoctor === day.weekendOff}
                          isDimmed={selectedDoctor && selectedDoctor !== day.weekendOff}
                        />
                      ) : (
                        <span className="text-[11px] text-slate-300 font-medium pl-2">
                          —
                        </span>
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditDay(day)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Day Schedule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDay(day)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Day Schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Showing <strong className="text-slate-800">{filteredData.length}</strong> of{' '}
          <strong className="text-slate-800">{rosterData.length}</strong> scheduled clinical days
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            1st Call = 24h Night Lead
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Amber Rows = Weekend Shift
          </span>
        </div>
      </div>
    </div>
  );
}
