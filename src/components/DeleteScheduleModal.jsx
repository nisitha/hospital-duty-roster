import React from 'react';
import { Trash2, X, Calendar } from 'lucide-react';
import { DOCTOR_MAP } from '../data/doctors';

export default function DeleteScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  dayData,
}) {
  if (!isOpen || !dayData) return null;

  const leadDoctor = DOCTOR_MAP[dayData.call1];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900">
              Remove Schedule Day?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to delete the roster schedule for this clinical day?
              This action will recalculate officer workloads.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Date:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {dayData.date} ({dayData.dayOfWeek})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">1st On-Call Night Lead:</span>
                <span className="font-bold text-purple-700">
                  {leadDoctor?.name || dayData.call1}
                </span>
              </div>
              {dayData.isWeekend && (
                <div className="flex items-center justify-between text-amber-700 font-semibold">
                  <span>Shift Category:</span>
                  <span>Weekend Duty</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(dayData.id);
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/20 transition-all active:scale-98"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
