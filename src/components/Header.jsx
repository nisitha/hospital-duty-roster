import React from 'react';
import {
  Stethoscope,
  Table,
  LayoutGrid,
  UserCheck,
  BarChart2,
  RotateCcw,
  Printer,
  Download,
} from 'lucide-react';

export default function Header({
  activeView,
  setActiveView,
  onResetData,
  onExportCSV,
  onPrint,
  rosterCount,
}) {
  const views = [
    { id: 'grid', label: 'Roster Grid', icon: Table, count: rosterCount },
    { id: 'cards', label: 'Daily Cards', icon: LayoutGrid },
    { id: 'doctor', label: 'Doctor View', icon: UserCheck },
    { id: 'analytics', label: 'Duty Analytics', icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3.5">
          {/* Clinical Title & Stethoscope Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-4 ring-indigo-50">
                <Stethoscope className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                    Hospital Medical Officer On-Call Duty Roster
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Clinical v2.4
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-medium text-slate-600">Department of General Medicine & Surgery</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live LocalSync Active
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Actions Button Group */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={onResetData}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                title="Reset Sample Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Utility Actions (Print / CSV / Reset) */}
          <div className="flex items-center justify-between md:justify-end gap-2 pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* View Switcher Tabs */}
            <div className="flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 overflow-x-auto text-xs font-medium">
              {views.map((view) => {
                const Icon = view.icon;
                const isActive = activeView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{view.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Quick Tools */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={onExportCSV}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                title="Export schedule to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>
              <button
                onClick={onPrint}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                title="Print Clinical Roster"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>
              <button
                onClick={onResetData}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                title="Reset to original 47-day clinical template (Oct 15 - Nov 30, 2026)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
