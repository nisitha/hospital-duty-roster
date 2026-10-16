import {
  generateRosterFromSeed,
  SEED_OCT_15,
  ROSTER_START_DATE,
  ROSTER_END_DATE,
} from '../utils/rosterAlgorithm';

/**
 * 47-Day Medical Officer Clinical On-Call Duty Roster
 * Range: October 15, 2026 (Thursday) to November 30, 2026 (Monday)
 * Generated strictly following clinical rotation rules and weekend-off coverage constraints.
 */
export const INITIAL_ROSTER_DATA = generateRosterFromSeed(SEED_OCT_15);

export { SEED_OCT_15, ROSTER_START_DATE, ROSTER_END_DATE };
