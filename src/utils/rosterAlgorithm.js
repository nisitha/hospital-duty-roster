/**
 * Clinical Duty Roster Rotation Algorithm & Scheduling Utilities
 * 
 * Rules:
 * 1. Date Range: October 15, 2026 to November 30, 2026 (47 Days)
 * 2. Base Daily Rotation (Day d -> Day d+1):
 *    next.call1 = prev.call5 (5th OPD -> 1st Night Lead)
 *    next.call2 = prev.call4 (4th Cover -> 2nd Day Lead)
 *    next.call3 = prev.call6 (6th Post-Call -> 3rd ICU/Ward)
 *    next.call4 = prev.call3 (3rd ICU -> 4th Cover)
 *    next.call5 = prev.call2 (2nd Day Lead -> 5th Day OPD)
 *    next.call6 = prev.call1 (1st Night Lead -> 6th Post-Call Rest)
 * 
 * 3. Weekend Off & Coverage:
 *    Allowed Weekend Offs:
 *    - Oct 16 - Oct 18: Dr. Haffna (H)
 *    - Oct 23 - Oct 25: Dr. Oshadi (O)
 *    - Oct 30 - Nov 01: Dr. Rilfna (R)
 *    - Subsequent weekends: weekendOff = null (unless manually configured)
 * 
 *    When weekendOff is active for Thursday's call1 officer (P1):
 *    - Friday:   call1: P5, call2: P3, call3: P6, call4: P2, call5: P4, call6: P1 (weekendOff: P1)
 *    - Saturday: call1: P2, call2: P6, call3: P1 (OFF), call4: P4 (Covers 3rd), call5: P3, call6: P5 (weekendOff: P1)
 *    - Sunday:   call1: P4, call2: P3, call3: P5, call4: P1 (OFF), call5: P6, call6: P2 (weekendOff: P1)
 *    - Monday:   Resumes exact base rotation [P3, P1, P2, P5, P6, P4] (weekendOff: null)
 * 
 *    When weekendOff is null on a weekend:
 *    - Uses standard Base Daily Rotation Mapping each day.
 */

import { DOCTOR_MAP } from '../data/doctors';

export const ROSTER_START_DATE = '2026-10-15';
export const ROSTER_END_DATE = '2026-11-30';

export const SEED_OCT_15 = {
  call1: 'H',
  call2: 'R',
  call3: 'T',
  call4: 'L',
  call5: 'O',
  call6: 'M',
  weekendOff: null,
};

// Check if a given date falls inside the 3 pre-approved weekend-off rotations
export function isAllowedWeekendOffPeriod(dateStr) {
  return (
    (dateStr >= '2026-10-16' && dateStr <= '2026-10-18') ||
    (dateStr >= '2026-10-23' && dateStr <= '2026-10-25') ||
    (dateStr >= '2026-10-30' && dateStr <= '2026-11-01')
  );
}

// Format or parse helper
export function getDayOfWeek(dateStr) {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[d.getDay()];
    }
  } catch {
    // fallback
  }
  return 'Clinical Day';
}

export function isWeekendDay(dateStr) {
  const day = getDayOfWeek(dateStr);
  return day === 'Saturday' || day === 'Sunday';
}

// Generate array of calendar day metadata from startDate to endDate
export function getDaysList(startDateStr = ROSTER_START_DATE, endDateStr = ROSTER_END_DATE) {
  const list = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const cur = new Date(start);

  while (cur <= end) {
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayOfWeek = getDayOfWeek(dateStr);
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

    list.push({
      date: dateStr,
      dayOfWeek,
      isWeekend,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return list;
}

/**
 * Standard Base Daily Rotation Mapping:
 * next.call1 = prev.call5
 * next.call2 = prev.call4
 * next.call3 = prev.call6
 * next.call4 = prev.call3
 * next.call5 = prev.call2
 * next.call6 = prev.call1
 */
export function baseDailyRotation(prev) {
  return {
    call1: prev.call5,
    call2: prev.call4,
    call3: prev.call6,
    call4: prev.call3,
    call5: prev.call2,
    call6: prev.call1,
    weekendOff: null,
  };
}

/**
 * Calculate the next day's slots based on the previous day and the clinical rules.
 */
export function calculateNextDaySlots(prevDay, curDate, curDayOfWeek, manualWeekendOffOverride = undefined) {
  const isWeekendOffWindow = isAllowedWeekendOffPeriod(curDate);
  const hasActiveWeekendOff =
    manualWeekendOffOverride !== undefined
      ? Boolean(manualWeekendOffOverride)
      : isWeekendOffWindow || Boolean(prevDay.weekendOff);

  // Transition into Friday with active weekendOff
  if (curDayOfWeek === 'Friday' && hasActiveWeekendOff) {
    const T = prevDay; // Thursday
    const weekendOffDoc = manualWeekendOffOverride || T.call1;
    return {
      call1: T.call5,
      call2: T.call3,
      call3: T.call6,
      call4: T.call2,
      call5: T.call4,
      call6: T.call1,
      weekendOff: weekendOffDoc,
    };
  }

  // Saturday with active weekendOff (Friday -> Saturday)
  if (curDayOfWeek === 'Saturday' && (prevDay.weekendOff || hasActiveWeekendOff)) {
    const F = prevDay; // Friday
    const weekendOffDoc = prevDay.weekendOff || F.call6;
    return {
      call1: F.call4,
      call2: F.call3,
      call3: F.call6,
      call4: F.call5,
      call5: F.call2,
      call6: F.call1,
      weekendOff: weekendOffDoc,
    };
  }

  // Sunday with active weekendOff (Saturday -> Sunday)
  if (curDayOfWeek === 'Sunday' && (prevDay.weekendOff || hasActiveWeekendOff)) {
    const S = prevDay; // Saturday
    const weekendOffDoc = prevDay.weekendOff || S.call3;
    return {
      call1: S.call4,
      call2: S.call5,
      call3: S.call6,
      call4: S.call3,
      call5: S.call2,
      call6: S.call1,
      weekendOff: weekendOffDoc,
    };
  }

  // Monday following an active weekendOff (Sunday -> Monday)
  if (curDayOfWeek === 'Monday' && prevDay.weekendOff) {
    const U = prevDay; // Sunday
    return {
      call1: U.call2,
      call2: U.call4,
      call3: U.call6,
      call4: U.call3,
      call5: U.call5,
      call6: U.call1,
      weekendOff: null,
    };
  }

  // All other days: standard Base Daily Rotation Mapping
  return baseDailyRotation(prevDay);
}

/**
 * Generate default clinical notes for scheduled days
 */
export function getAutomatedNote(dateStr, dayOfWeek, slots) {
  if (dateStr === '2026-10-15') {
    return 'Clinical Duty Roster Cycle Start - Internal Medicine Grand Rounds';
  }
  if (dateStr === '2026-10-16') {
    return 'Weekend Off: Dr. Haffna | Pre-weekend surgical audit & ICU bed check';
  }
  if (dateStr === '2026-10-17') {
    return 'Weekend Off: Dr. Haffna | Dr. Lakshitha covers 3rd ICU/Ward';
  }
  if (dateStr === '2026-10-18') {
    return 'Weekend Off: Dr. Haffna | Sunday ward review & discharge planning';
  }
  if (dateStr === '2026-10-19') {
    return 'Monday OPD surge management & Grand Round handover';
  }
  if (dateStr === '2026-10-23') {
    return 'Weekend Off: Dr. Oshadi | Dialysis & ICU census check';
  }
  if (dateStr === '2026-10-24') {
    return 'Weekend Off: Dr. Oshadi | Dr. Malsha covers 3rd ICU/Ward';
  }
  if (dateStr === '2026-10-25') {
    return 'Weekend Off: Dr. Oshadi | Cardiac telemetry patrol';
  }
  if (dateStr === '2026-10-30') {
    return 'Weekend Off: Dr. Rilfna | Emergency OT active & trauma standby';
  }
  if (dateStr === '2026-10-31') {
    return 'Weekend Off: Dr. Rilfna | Dr. Haffna covers 3rd ICU/Ward';
  }
  if (dateStr === '2026-11-01') {
    return 'Weekend Off: Dr. Rilfna | Multidisciplinary acute handover';
  }

  const leadDoc = DOCTOR_MAP[slots.call1]?.shortName || slots.call1;

  if (dayOfWeek === 'Monday') {
    return `Weekly clinical morbidity review & admissions lead: Dr. ${leadDoc}`;
  }
  if (dayOfWeek === 'Wednesday') {
    return `Mid-week critical care review & clinical pathology conference`;
  }
  if (dayOfWeek === 'Friday') {
    return `Pre-weekend blood bank & emergency reserve check: Dr. ${leadDoc}`;
  }
  if (dayOfWeek === 'Saturday') {
    return `Weekend emergency cover lead: Dr. ${leadDoc}`;
  }
  if (dayOfWeek === 'Sunday') {
    return `Sunday acute triage & evening ward patrol lead: Dr. ${leadDoc}`;
  }

  return `Day lead: Dr. ${leadDoc} • Acute clinical duty`;
}

/**
 * Generate full 47-day roster starting from October 15, 2026 to November 30, 2026
 */
export function generateRosterFromSeed(startDayObj = SEED_OCT_15, allDaysArray = null) {
  const days = allDaysArray || getDaysList(ROSTER_START_DATE, ROSTER_END_DATE);
  const roster = [];

  days.forEach((dayMeta, i) => {
    if (i === 0) {
      const initialSlots = {
        call1: startDayObj.call1 || 'H',
        call2: startDayObj.call2 || 'R',
        call3: startDayObj.call3 || 'T',
        call4: startDayObj.call4 || 'L',
        call5: startDayObj.call5 || 'O',
        call6: startDayObj.call6 || 'M',
        weekendOff: startDayObj.weekendOff || null,
      };

      roster.push({
        id: `roster-${dayMeta.date}`,
        date: dayMeta.date,
        dayOfWeek: dayMeta.dayOfWeek,
        isWeekend: dayMeta.isWeekend,
        ...initialSlots,
        notes: startDayObj.notes || getAutomatedNote(dayMeta.date, dayMeta.dayOfWeek, initialSlots),
      });
    } else {
      const prevDay = roster[i - 1];
      const slots = calculateNextDaySlots(prevDay, dayMeta.date, dayMeta.dayOfWeek);

      roster.push({
        id: `roster-${dayMeta.date}`,
        date: dayMeta.date,
        dayOfWeek: dayMeta.dayOfWeek,
        isWeekend: dayMeta.isWeekend,
        ...slots,
        notes: getAutomatedNote(dayMeta.date, dayMeta.dayOfWeek, slots),
      });
    }
  });

  return roster;
}

/**
 * Cascading Auto-Recalculation on Edit (Dynamic Ripple Update)
 * When Day X (at index editedIndex) is updated, forward-recalculate all subsequent dates:
 * Day X+1 through the end of the array.
 */
export function recalculateRosterFromIndex(rosterArray, editedIndex) {
  if (!Array.isArray(rosterArray) || editedIndex < 0 || editedIndex >= rosterArray.length - 1) {
    return rosterArray;
  }

  const updated = [...rosterArray];

  for (let i = editedIndex + 1; i < updated.length; i++) {
    const prevDay = updated[i - 1];
    const currentDay = updated[i];
    const nextSlots = calculateNextDaySlots(prevDay, currentDay.date, currentDay.dayOfWeek);

    updated[i] = {
      ...currentDay,
      ...nextSlots,
      // Retain custom notes if already manually edited, otherwise update with contextual automated note
      notes: currentDay.notes && !currentDay.notes.startsWith('Day lead:') && !currentDay.notes.startsWith('Weekly clinical')
        ? currentDay.notes
        : getAutomatedNote(currentDay.date, currentDay.dayOfWeek, nextSlots),
    };
  }

  return updated;
}
