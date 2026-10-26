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
  /** gray zone that punches through held zones (a city still being fought over inside an occupied sector);
   *  otherwise held zones are drawn over broad gray ones */
  cutsHeld?: boolean;
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
  /** air/missile only: follow every point (a real flight route) instead of one sweeping arc */
  route?: boolean;
  /** the target lies beyond the map edge where this arrow ends; shown as a tag at the tip */
  offMap?: string;
  /** the formation on this axis, as named by the sources (e.g. "92nd Armd Div", "III Corps") */
  unit?: string;
}

/** A formation that took part in an event but has no arrow of its own (reserves, air arms, HQs). */
export interface Force {
  side: Side | 'other';
  unit: string;
  note?: string;
}

/** An area drawn with an event's arrows: an ambush or kill zone, a dug-in line, a flooded barrier. */
export interface BattleArea {
  kind: 'trap' | 'defence' | 'water';
  side: Side | 'other';
  shape: LonLat[];
  label: string;
}

export type SiteKind = 'airbase' | 'oil' | 'port' | 'nuclear' | 'dam' | 'pass' | 'garrison' | 'command';

/** A strategic point that stays on the map: air bases, oil, ports, dams, passes, where formations were based. */
export interface Site {
  id: string;
  name: string;
  fa?: string;
  at: LonLat;
  kind: SiteKind;
  side: Side;
  note: string;
  /** shown only between these dates (ISO); e.g. a corps that was formed mid-war */
  from?: string;
  to?: string;
  /** 1 = always shown once zoomed in a little, 2 = only closer in */
  rank: 1 | 2;
}

export type EventKind = 'operation' | 'battle' | 'air' | 'naval' | 'political' | 'atrocity';

export interface WarEvent {
  id: string;
  date: string;
  end?: string;
  name: string;
  fa?: string;
  /** Arabic / Iraqi code name */
  ar?: string;
  kind: EventKind;
  side?: Side | 'both' | 'other';
  /** who came out ahead; omitted for political events */
  outcome?: Side | 'stalemate';
  summary: string;
  wiki?: string; // English Wikipedia title
  arrows?: Arrow[];
  places?: string[]; // place ids to highlight
  sites?: string[]; // strategic site ids to highlight
  forces?: Force[];
  areas?: BattleArea[];
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
