import React, { useState } from 'react';
import {
  X,
  Calendar,
  Moon,
  Sun,
  Activity,
  Shield,
  Stethoscope,
  Coffee,
  CalendarOff,
  AlertTriangle,
  Shuffle,
  RefreshCw,
} from 'lucide-react';
import { DOCTORS, DOCTOR_MAP } from '../data/doctors';
import { getDayOfWeek, isWeekendDay } from '../utils/rosterAlgorithm';

export default function AddEditScheduleModal({
  isOpen,
  onClose,
  onSave,
  editDayData, // null if Add Mode, or existing day object if Edit Mode
}) {
  const isEditMode = Boolean(editDayData);
  const initialDateStr = editDayData?.date || '2026-10-15';

  const [date, setDate] = useState(initialDateStr);
  const [dayOfWeek, setDayOfWeek] = useState(editDayData?.dayOfWeek || getDayOfWeek(initialDateStr));
  const [isWeekend, setIsWeekend] = useState(
    editDayData?.isWeekend !== undefined ? editDayData.isWeekend : isWeekendDay(initialDateStr)
  );
  const [call1, setCall1] = useState(editDayData?.call1 || 'H');
  const [call2, setCall2] = useState(editDayData?.call2 || 'R');
  const [call3, setCall3] = useState(editDayData?.call3 || 'T');
  const [call4, setCall4] = useState(editDayData?.call4 || 'L');
  const [call5, setCall5] = useState(editDayData?.call5 || 'O');
  const [call6, setCall6] = useState(editDayData?.call6 || 'M');
  const [weekendOff, setWeekendOff] = useState(editDayData?.weekendOff || '');
  const [notes, setNotes] = useState(editDayData?.notes || '');
  const [recalculateFollowing, setRecalculateFollowing] = useState(true);

  // Calculate day of week and weekend status whenever date changes
  const updateDateDetails = (selectedDate) => {
    setDate(selectedDate);
    if (!selectedDate) return;
    const dayName = getDayOfWeek(selectedDate);
    const weekend = isWeekendDay(selectedDate);
    setDayOfWeek(dayName);
    setIsWeekend(weekend);
    if (!weekend && !isEditMode) {
      setWeekendOff('');
    }
  };

  // Conflict Detection: check if any doctor is assigned to multiple slots on the same day
  const conflicts = React.useMemo(() => {
    const slots = [
      { name: '1st On-Call (Night)', code: call1 },
      { name: '2nd On-Call (Day)', code: call2 },
      { name: '3rd On-Call (ICU)', code: call3 },
      { name: '4th On-Call (Cover)', code: call4 },
      { name: '5th On-Call (OPD)', code: call5 },
      { name: '6th On-Call (Post-Call)', code: call6 },
    ];

    const counts = {};
    const conflictMsgs = [];

    slots.forEach((s) => {
      if (s.code) {
        counts[s.code] = counts[s.code] || [];
        counts[s.code].push(s.name);
      }
    });

    Object.keys(counts).forEach((code) => {
      if (counts[code].length > 1) {
        const docName = DOCTOR_MAP[code]?.name || code;
        conflictMsgs.push(
          `${docName} is assigned to multiple slots: ${counts[code].join(' & ')}`
        );
      }
    });

    return conflictMsgs;
  }, [call1, call2, call3, call4, call5, call6]);

  // Auto Fair Distribution: assign one distinct doctor to each of the 6 slots
  const handleAutoFillDistinct = () => {
    const shuffled = [...DOCTORS].map((d) => d.code);
    // Fair deterministic shift rotation
    setCall1(shuffled[0]);
    setCall2(shuffled[1]);
    setCall3(shuffled[2]);
    setCall4(shuffled[3]);
    setCall5(shuffled[4]);
    setCall6(shuffled[5]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) return;

    const payload = {
      id: editDayData ? editDayData.id : `roster-${date}`,
      date,
      dayOfWeek: dayOfWeek || 'Clinical Day',
      isWeekend,
      call1,
      call2,
      call3,
      call4,
      call5,
      call6,
      weekendOff: isWeekend ? (weekendOff || null) : null,
      notes,
    };

    onSave(payload, recalculateFollowing);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditMode ? 'Edit Medical Schedule Day' : 'Add New Clinical Roster Day'}
              </h3>
              <p className="text-xs text-indigo-200/80">
                Configure doctor assignments and 24h duty allocations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date & Day of Week */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Roster Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => updateDateDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Day of Week
              </label>
              <input
                type="text"
                readOnly
                value={dayOfWeek || 'Auto calculated'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shift Type
              </label>
              <div className="flex items-center h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                {isWeekend ? (
                  <span className="font-bold text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Weekend Roster
                  </span>
                ) : (
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Standard Weekday
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick distinct auto-fill button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Doctor Duty Assignments (6 Slots)
            </span>
            <button
              type="button"
              onClick={handleAutoFillDistinct}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Rotate 6 Distinct Officers</span>
            </button>
          </div>

          {/* Conflict Alert Warning */}
          {conflicts.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/90 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <strong className="font-bold">Duplicate Slot Warning:</strong>
                <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                  {conflicts.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Slot 1: 1st On-Call (Night) */}
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80">
              <label className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1.5">
                <Moon className="w-3.5 h-3.5 text-purple-600" />
                <span>1st On-Call (Full/Night Lead) *</span>
              </label>
              <select
                value={call1}
                onChange={(e) => setCall1(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {DOCTORS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name} ({d.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 2: 2nd On-Call (Day Lead) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>2nd On-Call (Acute Day Lead) *</span>
              </label>
              <select
                value={call2}
                onChange={(e) => setCall2(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {DOCTORS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name} ({d.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 3: 3rd On-Call (ICU/Ward) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-500" />
                <span>3rd On-Call (Ward / ICU Rounds) *</span>
              </label>
              <select
                value={call3}
                onChange={(e) => setCall3(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {DOCTORS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name} ({d.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 4: 4th On-Call (Cover) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>4th On-Call (Cover / Free Tag) *</span>
              </label>
              <select
                value={call4}
                onChange={(e) => setCall4(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {DOCTORS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name} ({d.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 5: 5th On-Call (OPD) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
                <span>5th On-Call (Day OPD / Clinic) *</span>
              </label>
              <select
                value={call5}
                onChange={(e) => setCall5(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {DOCTORS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name} ({d.shortName})
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 6: 6th On-Call (Post-Call) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                <Coffee className="w-3.5 h-3.5 text-teal-500" />
                <span>6th On-Call (Post-Call Recovery) *</span>
              </label>
              <select
                value={call6}
                onChange={(e) => setCall6(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {DOCTORS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name} ({d.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekend Off & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                <CalendarOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Weekend Protected Off (Optional)</span>
              </label>
              <select
                value={weekendOff}
                onChange={(e) => setWeekendOff(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">None / Not Applicable</option>
                {DOCTORS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name} (Weekend Off)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Handover / Ward Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. ICU rounds 08:30, Trauma call lead"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cascading Auto-Recalculation Toggle */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-start gap-3 shadow-2xs">
            <input
              type="checkbox"
              id="recalculate-following"
              checked={recalculateFollowing}
              onChange={(e) => setRecalculateFollowing(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="recalculate-following" className="text-xs text-slate-700 cursor-pointer select-none">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                Auto-recalculate all following dates based on rotation rules
              </span>
              <span className="text-slate-500 block mt-0.5 leading-relaxed">
                Automatically updates downstream shifts from Day X+1 to Nov 30, 2026 using clinical rotation and safe rest coverage rules.
              </span>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-98"
            >
              {isEditMode ? 'Update Schedule Day' : 'Add to Clinical Roster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
