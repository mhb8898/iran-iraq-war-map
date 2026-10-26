import { PHASES } from './data/phases';
import type { Phase, WarEvent } from './types';

// Which control snapshot the map shows for a date or an event. Shared by the app and scripts/check-events.ts.
const DAY = 864e5;

export const parseDate = (s: string) => new Date(`${s}T00:00:00Z`);

export const phaseAt = (d: Date): Phase => [...PHASES].reverse().find((p) => parseDate(p.date) <= d) ?? PHASES[0];

export const phaseBefore = (e: WarEvent) => [...PHASES].reverse().find((p) => p.date < e.date) ?? PHASES[0];

// Ground fighting shows the front once it's over; long air/naval campaigns and political events show it as they began.
export const phaseAfter = (e: WarEvent) =>
  (e.phase && PHASES.find((p) => p.id === e.phase)) ||
  (e.kind === 'operation' || e.kind === 'battle' ? phaseAt(new Date(parseDate(e.end ?? e.date).getTime() + 7 * DAY)) : phaseAt(parseDate(e.date)));
