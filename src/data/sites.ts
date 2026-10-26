import type { Site } from '../types';

// Strategic points that stay on the map. Coordinates are Wikipedia's where it has them (checked Oct 2026);
// Mina al-Bakr, Dez Dam, Qayyarah West, the passes and formation bases are placed from the map (±5 km).
// Formation bases show where a unit was stationed or held its sector, not where it fought on a given day.
export const SITES: Site[] = [
  // ── Iranian air bases (Tactical Fighter Bases) ─────────────────────────────────
  { id: 'mehrabad', name: 'Mehrabad (1st TFB)', fa: 'پایگاه یکم شکاری مهرآباد', at: [51.314, 35.689], kind: 'airbase', side: 'iran', rank: 1, note: 'Tehran\'s airport and the air force\'s 1st Tactical Fighter Base; the first target of Iraq\'s opening air strike on 22 September 1980.' },
  { id: 'tabriz-ab', name: 'Tabriz (2nd TFB)', fa: 'پایگاه دوم شکاری تبریز', at: [46.235, 38.134], kind: 'airbase', side: 'iran', rank: 1, note: 'Base covering the north-west; its jets joined the strikes on northern Iraq in Operation Kaman 99.' },
  { id: 'nojeh', name: 'Nojeh, Hamadan (3rd TFB)', fa: 'پایگاه سوم شکاری نوژه همدان', at: [48.653, 35.212], kind: 'airbase', side: 'iran', rank: 1, note: 'Shahid Nojeh air base: Iran\'s main F-4 Phantom base, out of reach of most Iraqi raids. Launched the strikes on Osirak, H-3 and Baghdad.' },
  { id: 'vahdati', name: 'Vahdati, Dezful (4th TFB)', fa: 'پایگاه چهارم شکاری وحدتی دزفول', at: [48.398, 32.434], kind: 'airbase', side: 'iran', rank: 1, note: 'Fighter base a few kilometres behind the Khuzestan front. Iraq shelled and bombed it from the first week of the war; keeping Iraqi guns out of range of it was a goal of Fath ol-Mobin.' },
  { id: 'omidiyeh', name: 'Omidiyeh (5th TFB)', fa: 'پایگاه پنجم شکاری امیدیه', at: [49.535, 30.835], kind: 'airbase', side: 'iran', rank: 1, note: 'Air base south-east of Ahvaz guarding the oil fields and the ports of Mahshahr and Bandar Khomeini.' },
  { id: 'bushehr-ab', name: 'Bushehr (6th TFB)', fa: 'پایگاه ششم شکاری بوشهر', at: [50.834, 28.945], kind: 'airbase', side: 'iran', rank: 1, note: 'F-4 base on the Gulf coast covering Kharg Island and the tanker routes; also a navy base.' },

  // ── Iraqi air bases ─────────────────────────────────────────────────────────────
  { id: 'rashid', name: 'Rashid air base', fa: 'پایگاه هوایی الرشید', at: [44.495, 33.278], kind: 'airbase', side: 'iraq', rank: 1, note: 'Baghdad\'s main military air base, in the south-east of the city; hit on the first day of Kaman 99.' },
  { id: 'balad', name: 'Al-Bakr (Balad)', fa: 'پایگاه هوایی البکر', at: [44.367, 33.933], kind: 'airbase', side: 'iraq', rank: 2, note: 'One of Iraq\'s largest bases, north of Baghdad, home to several fighter squadrons.' },
  { id: 'taqaddum', name: 'Al-Taqaddum', fa: 'پایگاه هوایی التقدم', at: [43.59, 33.339], kind: 'airbase', side: 'iraq', rank: 2, note: 'Base by Lake Habbaniyah west of Baghdad, out of reach of most Iranian strikes.' },
  { id: 'kirkuk-ab', name: 'Kirkuk (al-Hurriya)', fa: 'پایگاه هوایی کرکوک', at: [44.349, 35.469], kind: 'airbase', side: 'iraq', rank: 1, note: 'Northern base: struck by Iran in Kaman 99, and the take-off point for the chemical raids on Sardasht and Halabja.' },
  { id: 'qayyarah', name: 'Qayyarah West', fa: 'پایگاه قیاره', at: [43.125, 35.767], kind: 'airbase', side: 'iraq', rank: 2, note: 'Base south of Mosul, deep behind the northern front.' },
  { id: 'tallil', name: 'Tallil (Nasiriyah)', fa: 'پایگاه هوایی طلیل', at: [46.093, 30.94], kind: 'airbase', side: 'iraq', rank: 2, note: 'Southern base far enough from the front to escape Iranian artillery; fed the air war over Basra and the Gulf.' },
  { id: 'shaibah', name: 'Shaibah (Basra)', fa: 'پایگاه هوایی شعیبه', at: [47.643, 30.426], kind: 'airbase', side: 'iraq', rank: 1, note: 'Base south-west of Basra, within range of Iranian guns for much of the war; Iraqi raids on Khuzestan and the Gulf flew from here.' },

  // ── oil, ports, reactors, dams ───────────────────────────────────────────────────
  { id: 'abadan-refinery', name: 'Abadan refinery', fa: 'پالایشگاه آبادان', at: [48.275, 30.346], kind: 'oil', side: 'iran', rank: 1, note: 'Once the largest refinery in the world. Shelled from the first days of the war and out of action for most of it.' },
  { id: 'mahshahr', name: 'Bandar Khomeini & Mahshahr', fa: 'بندر امام خمینی و ماهشهر', at: [49.074, 30.506], kind: 'port', side: 'iran', rank: 1, note: 'With Khorramshahr lost, Iran\'s main port for imports and its petrochemical complex; struck repeatedly by Iraqi aircraft.' },
  { id: 'mina-al-bakr', name: 'Mina al-Bakr', fa: 'پایانه نفتی البکر', at: [48.81, 29.68], kind: 'oil', side: 'iraq', rank: 1, note: 'Iraq\'s offshore oil terminal (now the Basrah Oil Terminal), wrecked by Iran in Operation Morvarid in November 1980.' },
  { id: 'khor-al-amaya', name: 'Khor al-Amaya', fa: 'پایانه نفتی خورالعمیه', at: [48.807, 29.783], kind: 'oil', side: 'iraq', rank: 2, note: 'Iraq\'s second offshore terminal, destroyed with Mina al-Bakr in 1980. Iraq exported by pipeline through Turkey and Saudi Arabia for the rest of the war.' },
  { id: 'baba-gurgur', name: 'Kirkuk oil field', fa: 'میدان نفتی کرکوک', at: [44.336, 35.533], kind: 'oil', side: 'iraq', rank: 1, note: 'Baba Gurgur, Iraq\'s great northern field, feeding the pipeline to Turkey — a target for Iranian jets and Kurdish rebels alike.' },
  { id: 'rumaila', name: 'Rumaila oil field', fa: 'میدان نفتی رمیله', at: [47.408, 30.156], kind: 'oil', side: 'iraq', rank: 2, note: 'Iraq\'s giant southern field west of Basra, close behind the front.' },
  { id: 'tuwaitha', name: 'Osirak (Tuwaitha)', fa: 'نیروگاه اوسیراک', at: [44.515, 33.205], kind: 'nuclear', side: 'iraq', rank: 1, note: 'French-built research reactor south-east of Baghdad. Damaged by Iran (Sept. 1980), destroyed by Israel (June 1981).' },
  { id: 'bushehr-npp', name: 'Bushehr reactor site', fa: 'نیروگاه اتمی بوشهر', at: [50.886, 28.83], kind: 'nuclear', side: 'iran', rank: 2, note: 'Unfinished German-built nuclear plant, bombed by Iraq several times between 1984 and 1988.' },
  { id: 'dez-dam', name: 'Dez Dam', fa: 'سد دز', at: [48.464, 32.605], kind: 'dam', side: 'iran', rank: 2, note: 'Hydroelectric dam above Dezful and Andimeshk; Iraq\'s advance toward Dezful in 1980 brought its guns within reach of the area.' },
  { id: 'darbandikhan', name: 'Darbandikhan Dam', fa: 'سد دربندیخان', at: [45.706, 35.113], kind: 'dam', side: 'iraq', rank: 2, note: 'Dam on the Diyala (Sirwan) south of Halabja. Iran\'s Dawn 10 offensive in March 1988 drove toward it.' },
  { id: 'dukan', name: 'Dukan Dam', fa: 'سد دوکان', at: [44.953, 35.954], kind: 'dam', side: 'iraq', rank: 2, note: 'Dam on the Little Zab; with Darbandikhan, it waters and powers much of northern Iraq.' },

  // ── passes ──────────────────────────────────────────────────────────────────────
  { id: 'paytak', name: 'Pataq pass', fa: 'گردنه پاطاق', at: [46.06, 34.37], kind: 'pass', side: 'iran', rank: 1, note: 'The Zagros gate on the old Baghdad–Kermanshah–Tehran road. Iraq stopped short of it in 1980; the MEK drove through it in July 1988.' },
  { id: 'charzebar', name: 'Charzebar pass', fa: 'تنگه چهارزبر', at: [46.77, 34.19], kind: 'pass', side: 'iran', rank: 1, note: 'Narrow pass on the road to Kermanshah where the MEK column was stopped and destroyed in Operation Mersad.' },
  { id: 'chazabeh', name: 'Chazabeh pass', fa: 'تنگه چذابه', at: [47.84, 31.8], kind: 'pass', side: 'iran', rank: 1, note: 'Gap between the Hawizeh marshes and the sand dunes north of Bostan; taking it in Tariq al-Quds cut the Iraqi forces in Khuzestan in two.' },

  // ── where the armies were based ──────────────────────────────────────────────────
  // Iraqi corps held fixed sectors of the front for most of the war.
  { id: 'iq-1corps', name: 'Iraqi I Corps', fa: 'سپاه یکم عراق', at: [44.62, 35.38], kind: 'command', side: 'iraq', rank: 1, note: 'Held the northern front through Kurdistan, from the Turkish border to Darbandikhan, from its base at Kirkuk.' },
  { id: 'iq-2corps', name: 'Iraqi II Corps', fa: 'سپاه دوم عراق', at: [45.05, 33.95], kind: 'command', side: 'iraq', rank: 1, note: 'Held the central front from Khanaqin to Badra, covering the shortest road from Iran to Baghdad. Took Qasr-e Shirin and Mehran in 1980 and Mehran again in 1986.' },
  { id: 'iq-4corps', name: 'Iraqi IV Corps', fa: 'سپاه چهارم عراق', at: [47.0, 32.0], kind: 'command', side: 'iraq', rank: 1, from: '1981-01-01', note: 'Formed in 1981 for the sector between the Basra and central fronts, around Amarah; it took the brunt of Fath ol-Mobin and the 1983 Dawn offensives.' },
  { id: 'iq-3corps', name: 'Iraqi III Corps', fa: 'سپاه سوم عراق', at: [47.58, 30.72], kind: 'command', side: 'iraq', rank: 1, note: 'Led the invasion of Khuzestan, then held Basra and the marshes north of it — the war\'s decisive front.' },
  { id: 'iq-7corps', name: 'Iraqi VII Corps', fa: 'سپاه هفتم عراق', at: [47.62, 30.22], kind: 'command', side: 'iraq', rank: 1, from: '1986-01-01', note: 'Held al-Faw and the lower Shatt al-Arab from the mid-1980s; lost Faw in February 1986 and retook it with the Republican Guard in April 1988.' },
  { id: 'iq-rg', name: 'Republican Guard', fa: 'گارد ریاست‌جمهوری عراق', at: [44.2, 33.42], kind: 'command', side: 'iraq', rank: 1, note: 'Saddam\'s praetorian guard in Baghdad. From 1986 it was expanded into a corps-sized reserve of armoured and commando divisions and sent wherever the front broke.' },
  // Iranian army divisions at their peacetime garrisons; Revolutionary Guard units had no fixed bases at the outbreak.
  { id: 'ir-92', name: '92nd Armd Div', fa: 'لشکر ۹۲ زرهی خوزستان', at: [48.6, 31.4], kind: 'garrison', side: 'iran', rank: 1, note: 'Ahvaz: Khuzestan\'s own armoured division, the first regular force to meet the invasion and in almost every southern battle after.' },
  { id: 'ir-81', name: '81st Armd Div', fa: 'لشکر ۸۱ زرهی کرمانشاه', at: [47.15, 34.4], kind: 'garrison', side: 'iran', rank: 1, note: 'Kermanshah: guarded the central front and the road to Tehran; fought the MEK in Operation Mersad.' },
  { id: 'ir-28', name: '28th Inf Div', fa: 'لشکر ۲۸ پیاده کردستان', at: [47.0, 35.31], kind: 'garrison', side: 'iran', rank: 2, note: 'Sanandaj: the Kurdistan division, fighting Kurdish insurgents as well as Iraq; in the northern Dawn offensives.' },
  { id: 'ir-64', name: '64th Inf Div', fa: 'لشکر ۶۴ پیاده ارومیه', at: [45.07, 37.55], kind: 'garrison', side: 'iran', rank: 2, note: 'Urmia: the north-west division; took part in Dawn 2 at Haj Omran.' },
  { id: 'ir-16', name: '16th Armd Div', fa: 'لشکر ۱۶ زرهی قزوین', at: [50.0, 36.27], kind: 'garrison', side: 'iran', rank: 2, note: 'Qazvin: armoured reserve sent south in 1980; lost much of its armour in Operation Nasr.' },
  { id: 'ir-84', name: '84th Inf Bde', fa: 'تیپ ۸۴ پیاده خرم‌آباد', at: [48.35, 33.49], kind: 'garrison', side: 'iran', rank: 2, note: 'Khorramabad: rushed to the Dezful front in 1980; in Fath ol-Mobin.' },
];

export const siteById = Object.fromEntries(SITES.map((s) => [s.id, s]));
