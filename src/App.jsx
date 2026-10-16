import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiScorecards from './components/KpiScorecards';
import StaffLegendBar from './components/StaffLegendBar';
import RosterGrid from './components/RosterGrid';
import DailyCardsView from './components/DailyCardsView';
import DoctorWorkloadView from './components/DoctorWorkloadView';
import DutyAnalyticsView from './components/DutyAnalyticsView';
import AddEditScheduleModal from './components/AddEditScheduleModal';
import DeleteScheduleModal from './components/DeleteScheduleModal';
import Toast from './components/Toast';

import { INITIAL_ROSTER_DATA } from './data/mockRoster';
import { DOCTOR_MAP } from './data/doctors';
import { recalculateRosterFromIndex } from './utils/rosterAlgorithm';

const STORAGE_KEY = 'hospital_medical_officer_roster_v3';

export default function App() {
  // State: Roster Schedule Data with LocalStorage Persistence
  const [rosterData, setRosterData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load roster from localStorage:', e);
    }
    return INITIAL_ROSTER_DATA;
  });

  // Active View Tab: 'grid' | 'cards' | 'doctor' | 'analytics'
  const [activeView, setActiveView] = useState('grid');

  // Interactive Staff Legend Filter: null (all) or doctor code ('H', 'R', etc.)
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDay, setDeletingDay] = useState(null);

  // Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync with LocalStorage whenever rosterData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rosterData));
    } catch (e) {
      console.error('Failed to save roster to localStorage:', e);
    }
  }, [rosterData]);

  // Handlers for Add / Edit
  const handleOpenAddModal = () => {
    setEditingDay(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (day) => {
    setEditingDay(day);
    setIsAddEditModalOpen(true);
  };

  const handleSaveDaySchedule = (dayData, shouldRecalculateFollowing = true) => {
    setRosterData((prev) => {
      const existingIndex = prev.findIndex((d) => d.id === dayData.id || d.date === dayData.date);

      if (existingIndex >= 0) {
        // Update existing day
        let updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...dayData };
        // Sort chronologically by date
        updated.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Auto-recalculate following dates forward from edited index
        const sortedIndex = updated.findIndex((d) => d.id === dayData.id || d.date === dayData.date);
        if (shouldRecalculateFollowing && sortedIndex >= 0 && sortedIndex < updated.length - 1) {
          updated = recalculateRosterFromIndex(updated, sortedIndex);
          showToast('Schedule updated & subsequent days recalculated!', 'success');
        } else {
          showToast(`Roster updated for ${dayData.date}`, 'success');
        }
        return updated;
      } else {
        // Add new day
        let updated = [...prev, dayData];
        updated.sort((a, b) => new Date(a.date) - new Date(b.date));

        const newIndex = updated.findIndex((d) => d.id === dayData.id || d.date === dayData.date);
        if (shouldRecalculateFollowing && newIndex >= 0 && newIndex < updated.length - 1) {
          updated = recalculateRosterFromIndex(updated, newIndex);
          showToast('New schedule added & subsequent days recalculated!', 'success');
        } else {
          showToast(`New schedule added for ${dayData.date}`, 'success');
        }
        return updated;
      }
    });
  };

  // Handlers for Delete
  const handleOpenDeleteModal = (day) => {
    setDeletingDay(day);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (dayId) => {
    setRosterData((prev) => {
      const updated = prev.filter((d) => d.id !== dayId);
      showToast('Clinical schedule day removed', 'info');
      return updated;
    });
  };

  // Reset to original 47-day clinical template (Oct 15 - Nov 30, 2026)
  const handleResetData = () => {
    if (
      window.confirm(
        'Reset schedule to the default 47-day clinical duty roster template (Oct 15 - Nov 30, 2026)? Custom changes will be overwritten.'
      )
    ) {
      setRosterData(INITIAL_ROSTER_DATA);
      setSelectedDoctor(null);
      showToast('Reset to original 47-day clinical duty roster (Oct 15 - Nov 30, 2026)', 'info');
    }
  };

  // Export Roster to CSV
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Day of Week',
      'Is Weekend',
      '1st On-Call (Night)',
      '2nd On-Call (Day)',
      '3rd On-Call (ICU)',
      '4th On-Call (Cover)',
      '5th On-Call (OPD)',
      '6th On-Call (Post-Call)',
      'Weekend Off',
      'Notes',
    ];

    const rows = rosterData.map((d) => [
      d.date,
      d.dayOfWeek,
      d.isWeekend ? 'Yes' : 'No',
      DOCTOR_MAP[d.call1]?.name || d.call1 || '',
      DOCTOR_MAP[d.call2]?.name || d.call2 || '',
      DOCTOR_MAP[d.call3]?.name || d.call3 || '',
      DOCTOR_MAP[d.call4]?.name || d.call4 || '',
      DOCTOR_MAP[d.call5]?.name || d.call5 || '',
      DOCTOR_MAP[d.call6]?.name || d.call6 || '',
      DOCTOR_MAP[d.weekendOff]?.name || d.weekendOff || 'None',
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Medical_Officer_OnCall_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Roster exported to CSV file', 'success');
  };

  // Print Roster
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        rosterCount={rosterData.length}
      />

      {/* Main Clinical Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Scorecards Bar */}
        <KpiScorecards rosterData={rosterData} />

        {/* Interactive Staff Legend Bar & CTA */}
        <StaffLegendBar
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
          onOpenAddModal={handleOpenAddModal}
          rosterData={rosterData}
        />

        {/* View Modes */}
        {activeView === 'grid' && (
          <RosterGrid
            rosterData={rosterData}
            selectedDoctor={selectedDoctor}
            onEditDay={handleOpenEditModal}
            onDeleteDay={handleOpenDeleteModal}
          />
        )}

        {activeView === 'cards' && (
          <DailyCardsView
            rosterData={rosterData}
            selectedDoctor={selectedDoctor}
            onEditDay={handleOpenEditModal}
            onDeleteDay={handleOpenDeleteModal}
          />
        )}

        {activeView === 'doctor' && (
          <DoctorWorkloadView
            rosterData={rosterData}
            selectedDoctorCode={selectedDoctor}
            onSelectDoctor={(code) => setSelectedDoctor(code)}
          />
        )}

        {activeView === 'analytics' && (
          <DutyAnalyticsView rosterData={rosterData} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2026 Clinical Operations & Medical Officer Scheduling System. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Local Storage Active</span>
            <span>•</span>
            <span>Safe Rest Compliant</span>
            <span>•</span>
            <span>6 Medical Officers</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {isAddEditModalOpen && (
        <AddEditScheduleModal
          key={editingDay ? editingDay.id : 'new-day'}
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          onSave={handleSaveDaySchedule}
          editDayData={editingDay}
        />
      )}

      <DeleteScheduleModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        dayData={deletingDay}
      />

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
