export type LonLat = [number, number];
export type Side = 'iran' | 'iraq';

/** A drawn area of control. `shape` is sketched loosely and overshoots the international
 *  border; it is clipped at runtime to the country named by `on`, so the edge that follows
 *  the border is exact and only the front-line edge is hand-drawn. */
/** Follow a river's course between the points nearest to `from` and `to`. */
export interface RiverEdge {
  river: string;
  from: LonLat;
  to: LonLat;
}

export interface Zone {
  id: string;
  on: 'IRN' | 'IRQ';
  shape: (LonLat | RiverEdge)[];
  label: string;
  note?: string;
}

export interface Phase {
  id: string;
  date: string; // ISO date the snapshot describes
  label: string;
  iraqHeld: string[]; // zone ids on Iranian soil held by Iraq
  iranHeld: string[]; // zone ids on Iraqi soil held by Iran
  contested: string[]; // gray: neither side in full control
  note: string;
  /** a superseded legal border to draw alongside today's */
  border?: '1937';
}

export type ArrowKind = 'attack' | 'counter' | 'retreat' | 'air' | 'missile' | 'naval';

export interface Arrow {
  side: Side | 'other';
  kind?: ArrowKind;
  path: LonLat[];
  label?: string;
}

export type EventKind = 'operation' | 'battle' | 'air' | 'naval' | 'political' | 'atrocity';

export interface WarEvent {
  id: string;
  date: string;
  end?: string;
  name: string;
  fa?: string;
  kind: EventKind;
  side?: Side | 'both' | 'other';
  /** who came out ahead; omitted for political events */
  outcome?: Side | 'stalemate';
  summary: string;
  wiki?: string; // English Wikipedia title
  arrows?: Arrow[];
  places?: string[]; // place ids to highlight
  focus?: [number, number, number, number]; // w,s,e,n; defaults to arrows+places bbox
  refs?: string[];
  /** phase to show once the event is over, when it isn't the nearest snapshot */
  phase?: string;
}

export interface Place {
  id: string;
  name: string;
  fa: string;
  at: LonLat;
  iso: 'IRN' | 'IRQ' | 'KWT';
  rank: 1 | 2 | 3; // 1 = capital / major city
}

export interface WikiEntry {
  title: string;
  url: string;
  extract: string;
  thumb?: { src: string; width: number; height: number };
  image?: string; // Commons file name
  coords?: LonLat;
  fa?: { title: string; url: string };
}
