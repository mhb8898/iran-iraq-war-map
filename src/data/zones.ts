import type { Zone } from '../types';

// Hand-drawn front lines. Only the edge away from the international border is drawn;
// the rest is clipped to the real border (Natural Earth 10m). All front lines are
// approximations from the sources in refs.ts; treat them as schematic to ~5–10 km.
export const ZONES: Zone[] = [
  // ── Iraqi-held, Iranian soil ─────────────────────────────────────────────────────
  {
    id: 'khuz-karun-bridgehead', on: 'IRN', label: 'Iraqi bridgehead east of the Karun',
    note: 'Cut the Abadan–Ahvaz and Abadan–Mahshahr roads; Abadan held out, supplied over the Bahmanshir.',
    shape: [[48.24, 30.47], [48.3, 30.45], [48.4, 30.48], [48.48, 30.56], [48.46, 30.66], [48.38, 30.7], [48.31, 30.66], [48.27, 30.56]],
  },
  {
    id: 'khuz-south', on: 'IRN', label: 'Khorramshahr – Hoveyzeh sector',
    note: 'West bank of the Karun from Khorramshahr to ~15 km south-west of Ahvaz, Hamid garrison and Hoveyzeh.',
    shape: [[47.4, 30.3], [48.12, 30.39], [48.2, 30.43], [48.24, 30.5], [48.27, 30.6], [48.32, 30.7], [48.38, 30.8], [48.45, 30.95], [48.52, 31.08], [48.58, 31.17], [48.45, 31.25], [48.4, 31.4], [48.36, 31.48], [48.25, 31.5], [48.14, 31.53], [48.1, 31.55], [47.4, 31.55]],
  },
  {
    id: 'khuz-bostan', on: 'IRN', label: 'Bostan – Allah-o Akbar heights',
    note: 'Susangerd, at the eastern tip, was besieged but never held.',
    shape: [[47.4, 31.55], [48.1, 31.55], [48.13, 31.6], [48.15, 31.66], [48.12, 31.76], [48.06, 31.84], [48.1, 31.9], [47.4, 31.95]],
  },
  {
    id: 'khuz-karkheh', on: 'IRN', label: 'West of the Karkheh (Shush – Dezful front)',
    note: 'Iraqi artillery here shelled Dezful, Andimeshk and the Dezful air base.',
    shape: [[47.2, 31.95], [48.1, 31.9], [48.18, 32.05], [48.17, 32.2], [48.15, 32.32], [48.05, 32.42], [47.8, 32.46], [47.55, 32.42], [47.2, 32.35]],
  },
  {
    id: 'musian', on: 'IRN', label: 'Musian – Ein Khosh strip',
    shape: [[47.0, 32.38], [47.55, 32.42], [47.58, 32.55], [47.42, 32.62], [47.2, 32.62], [47.05, 32.55]],
  },
  {
    id: 'mehran', on: 'IRN', label: 'Mehran',
    shape: [[45.9, 32.95], [46.25, 33.03], [46.3, 33.18], [46.15, 33.3], [45.95, 33.25]],
  },
  {
    id: 'central-1980', on: 'IRN', label: 'Sumar – Naft-e Shahr – Qasr-e Shirin',
    note: 'Gilan-e Gharb and Sarpol-e Zahab stayed Iranian; Iraqi guns held the heights above them.',
    shape: [[45.3, 33.7], [45.62, 33.62], [45.78, 33.85], [45.75, 34.05], [45.8, 34.25], [45.8, 34.42], [45.72, 34.58], [45.62, 34.68], [45.4, 34.7], [45.25, 34.2]],
  },
  {
    id: 'central-enclave', on: 'IRN', label: 'Naft-e Shahr – Qasr-e Shirin border belt',
    note: 'After June 1982 the front here ran through Iranian soil; Iraqi units kept positions around Naft-e Shahr and Qasr-e Shirin. Extent uncertain.',
    shape: [[45.3, 33.8], [45.58, 33.78], [45.62, 34.0], [45.6, 34.2], [45.66, 34.45], [45.62, 34.62], [45.35, 34.62]],
  },
  {
    id: '1988-dehloran', on: 'IRN', label: 'July 1988 Iraqi thrust (Dehloran)',
    shape: [[46.9, 32.35], [47.75, 32.3], [47.8, 32.6], [47.35, 32.85], [47.0, 32.8]],
  },
  {
    id: '1988-khuz', on: 'IRN', label: 'July 1988 Iraqi thrust (Khuzestan)',
    note: 'Iraqi armour re-entered Khuzestan on 22 July and pulled back within days.',
    shape: [[47.5, 30.5], [48.05, 30.55], [48.2, 30.9], [48.15, 31.35], [47.95, 31.6], [47.5, 31.6]],
  },
  {
    id: '1988-mersad', on: 'IRN', label: 'MEK "Forough-e Javidan" corridor',
    note: 'The MEK column drove from Qasr-e Shirin toward Kermanshah and was destroyed at Charzebar pass (Operation Mersad).',
    shape: [[45.45, 34.42], [45.9, 34.33], [46.5, 34.03], [46.62, 34.14], [45.95, 34.56], [45.45, 34.64]],
  },

  // ── Iranian-held, Iraqi soil ─────────────────────────────────────────────────────
  {
    id: 'hajomran', on: 'IRQ', label: 'Haj Omran salient',
    note: 'Taken in Valfajr-2 with help from Iraqi Kurdish (KDP) fighters.',
    shape: [[44.85, 36.56], [45.2, 36.5], [45.2, 36.82], [44.85, 36.8]],
  },
  {
    id: 'penjwen', on: 'IRQ', label: 'Heights around Penjwen',
    shape: [[45.97, 35.55], [46.15, 35.5], [46.15, 35.74], [45.98, 35.7]],
  },
  {
    id: 'majnoon', on: 'IRQ', label: 'Majnoon Islands',
    note: 'Artificial islands over a giant oil field inside the Hawizeh marshes.',
    shape: [[47.5, 30.95], [47.7, 30.95], [47.7, 31.2], [47.5, 31.2]],
  },
  {
    id: 'faw', on: 'IRQ', label: 'Al-Faw peninsula',
    note: 'Iraq lost its only direct access to the Gulf for two years.',
    shape: [[47.98, 29.8], [48.8, 29.8], [48.6, 30.05], [48.32, 30.2], [48.15, 30.13], [47.98, 30.0]],
  },
  {
    id: 'basra-east', on: 'IRQ', label: 'East of Basra (Fish Lake)',
    note: 'Iranian gains of Karbala-5: within ~12 km of Basra.',
    shape: [[47.92, 30.42], [48.1, 30.38], [48.1, 30.63], [47.95, 30.63]],
  },
  {
    id: 'halabja', on: 'IRQ', label: 'Halabja – Khurmal',
    shape: [[45.8, 35.05], [46.25, 35.05], [46.25, 35.42], [45.85, 35.42], [45.75, 35.2]],
  },

  // ── Contested / not fully controlled (gray) ──────────────────────────────────────
  {
    id: 'kurdistan-irn', on: 'IRN', label: 'Iranian Kurdistan (KDPI insurgency)',
    note: 'Kurdish parties held much of the countryside 1979–83; Tehran retook the towns first.',
    shape: [[44.8, 35.7], [46.5, 35.7], [46.6, 36.4], [46.3, 37.0], [45.3, 37.25], [44.8, 36.8]],
  },
  {
    id: 'kurdistan-irq', on: 'IRQ', label: 'Iraqi Kurdish highlands (Peshmerga)',
    note: 'KDP and PUK fighters, backed by Iran, held the border mountains; Baghdad held the towns.',
    shape: [[44.3, 36.1], [45.4, 35.4], [46.3, 35.35], [45.6, 36.5], [44.9, 37.2], [44.2, 37.05]],
  },
  {
    id: 'hawizeh', on: 'IRQ', label: 'Hawizeh marshes',
    note: 'Reed beds and waterways fought over by boat and on foot from 1984 to 1988.',
    shape: [[47.42, 31.2], [47.75, 31.2], [47.8, 31.75], [47.55, 31.78], [47.42, 31.5]],
  },
];

export const zoneById = Object.fromEntries(ZONES.map((z) => [z.id, z]));
