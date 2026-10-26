import type { WarEvent } from '../types';

// Arrows are schematic axes of advance drawn from the sources in refs.ts, not unit tracks.
// Paths are [lon, lat]. `wiki` titles are verified by scripts/fetch-wiki.mjs.
const BAGHDAD: [number, number] = [44.37, 33.31];
const TEHRAN: [number, number] = [51.39, 35.69];
const HAMADAN: [number, number] = [48.52, 34.8];

export const EVENTS: WarEvent[] = [
  // ── Before the war ──────────────────────────────────────────────────────────────
  {
    id: 'treaty-1937', date: '1937-07-04', name: 'Frontier treaty of 1937', kind: 'political',
    summary: 'Under British influence, Iraq and Iran sign a treaty putting the Shatt al-Arab border on the Iranian bank for most of its length, leaving the river almost entirely Iraqi except at Abadan. Iran resents it for three decades.',
    wiki: 'Shatt al-Arab', places: ['khorramshahr', 'abadan', 'basra'], focus: [47.6, 29.8, 48.8, 30.8], refs: ['hiro', 'karsh'],
  },
  {
    id: 'abrogation-1969', date: '1969-04-19', name: 'Shah abrogates the 1937 treaty', fa: 'لغو قرارداد ۱۹۳۷', kind: 'political', side: 'iran',
    summary: 'Mohammad Reza Shah declares the 1937 treaty void and sends merchant ships up the Shatt under naval escort with Iranian flags. Iraq backs down; Iran begins arming the Iraqi Kurdish revolt.',
    wiki: 'Shatt al-Arab', places: ['khorramshahr', 'abadan'], focus: [47.6, 29.8, 48.8, 30.8], refs: ['hiro', 'razoux'],
  },
  {
    id: 'kurdish-war-1974', date: '1974-03-11', end: '1975-03-06', name: 'Second Iraqi–Kurdish War', kind: 'battle', side: 'other',
    summary: 'Mustafa Barzani\'s Kurds fight Baghdad with Iranian artillery support across the border. The cost of the war pushes Saddam Hussein, then vice-president, to trade the Shatt for an end to Iranian aid.',
    wiki: 'Second Iraqi–Kurdish War', places: ['sulaymaniyah', 'hajomran', 'piranshahr'], refs: ['hiro'],
  },
  {
    id: 'algiers', date: '1975-03-06', name: 'Algiers Agreement', fa: 'قرارداد ۱۹۷۵ الجزایر', kind: 'political',
    summary: 'The Shah and Saddam, brokered by Algeria\'s Houari Boumediene, agree to fix the river border on the thalweg (deepest channel) of the Shatt al-Arab. Iran ends support for the Kurds within days. The full treaty is signed in Baghdad on 13 June 1975 — it is the legal border shown on this map.',
    wiki: '1975 Algiers Agreement', places: ['khorramshahr', 'abadan', 'faw', 'basra'], focus: [47.6, 29.8, 48.8, 30.8], refs: ['algiers-text', 'hiro'],
  },
  {
    id: 'revolution', date: '1979-02-11', name: 'Iranian Revolution', fa: 'انقلاب ۱۳۵۷', kind: 'political', side: 'iran',
    summary: 'The monarchy falls. Purges hollow out the officer corps, the US arms pipeline closes, and the new government calls on Iraq\'s Shia to rise. Kurdish parties take much of Iran\'s north-west.',
    wiki: 'Iranian Revolution', places: ['tehran', 'mahabad'], refs: ['razoux', 'murray-woods'],
  },
  {
    id: 'saddam-president', date: '1979-07-16', name: 'Saddam Hussein becomes president', kind: 'political', side: 'iraq',
    summary: 'Saddam takes full power and purges the Ba\'ath leadership days later. He sees Iran\'s chaos as a chance to reverse Algiers and make Iraq the leading Gulf power.',
    wiki: 'Saddam Hussein', places: ['baghdad'], refs: ['woods-saddam', 'murray-woods'],
  },
  {
    id: 'sadr-executed', date: '1980-04-09', name: 'Execution of Mohammad Baqir al-Sadr', kind: 'political', side: 'iraq',
    summary: 'After an assassination attempt on Tariq Aziz, Baghdad executes the Shia cleric al-Sadr and expels tens of thousands of Iraqis of Iranian descent. Border clashes multiply through the summer.',
    wiki: 'Mohammad Baqir al-Sadr', places: ['baghdad'], refs: ['hiro', 'razoux'],
  },
  {
    id: 'algiers-torn', date: '1980-09-17', name: 'Saddam tears up the Algiers Agreement', kind: 'political', side: 'iraq',
    summary: 'On television before parliament, Saddam declares the 1975 agreement void and claims the whole Shatt al-Arab. Iraq dates the war from border fighting on 4 September around Zain al-Qaws and Saif Saad.',
    wiki: '1975 Algiers Agreement', places: ['naftshahr', 'sumar', 'baghdad'], refs: ['woods-saddam', 'razoux'],
  },

  // ── 1980 ────────────────────────────────────────────────────────────────────────
  {
    id: 'invasion', date: '1980-09-22', name: 'Iraqi invasion of Iran', fa: 'تهاجم عراق به ایران', ar: 'قادسية صدام', kind: 'operation', side: 'iraq', outcome: 'iraq',
    summary: 'Iraqi aircraft strike ten Iranian air bases, then six divisions cross on a 644 km front. Four go into Khuzestan — oil, an Arab minority Baghdad hoped would rise, and the Shatt — to besiege Khorramshahr and Abadan and screen Ahvaz, Susangerd and Dezful. Two more take Mehran and the ground in front of Qasr-e Shirin to block the old invasion route toward Baghdad. Iraq\'s propaganda named the war "Saddam\'s Qadisiyyah", after the 7th-century Arab victory over Persia. The air strikes fail: Iran\'s jets were sheltered in hardened bunkers.',
    wiki: 'Iraqi invasion of Iran',
    arrows: [
      { side: 'iraq', kind: 'air', path: [BAGHDAD, [48.0, 35.3], TEHRAN], label: 'Air strike: Mehrabad' },
      { side: 'iraq', kind: 'air', path: [BAGHDAD, [46.7, 32.9], [48.4, 32.43]], label: 'Vahdati air base' },
      { side: 'iraq', path: [[47.8, 30.52], [47.98, 30.5], [48.16, 30.45]], label: 'Khorramshahr' },
      { side: 'iraq', path: [[47.75, 30.68], [48.05, 30.78], [48.35, 30.98], [48.55, 31.16]], label: 'Toward Ahvaz' },
      { side: 'iraq', path: [[47.55, 31.8], [47.85, 31.78], [47.99, 31.72], [48.16, 31.6]], label: 'Bostan → Susangerd' },
      { side: 'iraq', path: [[47.55, 32.2], [47.75, 32.1], [47.95, 32.15], [48.14, 32.25]], label: 'Toward Dezful' },
      { side: 'iraq', path: [[45.85, 32.95], [46.0, 33.05], [46.16, 33.12]], label: 'Mehran' },
      { side: 'iraq', path: [[45.3, 33.8], [45.45, 33.84], [45.64, 33.86]], label: 'Sumar' },
      { side: 'iraq', path: [[45.25, 34.45], [45.45, 34.5], [45.58, 34.51], [45.78, 34.45]], label: 'Qasr-e Shirin' },
    ],
    places: ['khorramshahr', 'susangerd', 'dezful', 'mehran', 'qasreshirin'], focus: [44.2, 29.9, 51.6, 35.9], refs: ['woods-saddam', 'pollack', 'murray-woods', 'unsc-479'], phase: 'invasion-max',
  },
  {
    id: 'kaman99', date: '1980-09-23', name: 'Operation Kaman 99', fa: 'عملیات کمان ۹۹', kind: 'air', side: 'iran', outcome: 'iran',
    summary: 'The day after the invasion, around 140 Iranian F-4s and F-5s strike Iraqi air bases and oil targets. It is one of the largest air operations of the war and shows the Iraqi leadership that the Iranian air force survived.',
    wiki: 'Operation Kaman 99',
    arrows: [
      { side: 'iran', kind: 'air', path: [HAMADAN, [46.5, 34.3], BAGHDAD], label: 'Baghdad bases' },
      { side: 'iran', kind: 'air', path: [[46.24, 38.05], [45.3, 36.8], [44.39, 35.47]], label: 'Kirkuk' },
      { side: 'iran', kind: 'air', path: [[50.83, 28.95], [49.3, 30.0], [47.81, 30.5]], label: 'Basra' },
    ],
    places: ['baghdad', 'kirkuk', 'basra'], refs: ['razoux', 'cordesman'],
  },
  {
    id: 'scorch-sword', date: '1980-09-30', name: 'Operation Scorch Sword', kind: 'air', side: 'iran', outcome: 'stalemate',
    summary: 'Two Iranian F-4 Phantoms bomb the Osirak nuclear reactor site near Baghdad, causing limited damage. Israel destroys the reactor the following June.',
    wiki: 'Operation Scorch Sword',
    arrows: [{ side: 'iran', kind: 'air', path: [HAMADAN, [46.3, 34.4], [44.52, 33.21]], label: 'Osirak (Tuwaitha)' }],
    places: ['baghdad'], focus: [44.0, 32.8, 49.0, 35.3], refs: ['razoux'],
  },
  {
    id: 'khorramshahr-1980', date: '1980-09-22', end: '1980-11-10', name: 'Battle of Khorramshahr', fa: 'نبرد خرمشهر', kind: 'battle', side: 'iraq', outcome: 'iraq',
    summary: 'A few thousand regulars, Revolutionary Guards and volunteers hold the port for 34 days of street fighting. Iraq takes the city at heavy cost; Iranians come to call it "Khuninshahr", city of blood.',
    wiki: 'Battle of Khorramshahr (1980)',
    arrows: [
      { side: 'iraq', path: [[47.95, 30.52], [48.08, 30.48], [48.17, 30.44]] },
      { side: 'iraq', path: [[48.02, 30.66], [48.14, 30.55], [48.18, 30.46]] },
    ],
    places: ['khorramshahr', 'abadan', 'shalamcheh'], focus: [47.85, 30.25, 48.55, 30.75], refs: ['pollack', 'razoux'],
  },
  {
    id: 'abadan-siege', date: '1980-11-10', end: '1981-09-27', name: 'Siege of Abadan', fa: 'محاصره آبادان', kind: 'battle', side: 'iraq', outcome: 'iran',
    summary: 'Iraqi forces cross the Karun north of Abadan and cut its roads, but never close the ring: the island refinery city is supplied at night across the Bahmanshir. The siege lasts ten months.',
    wiki: 'Siege of Abadan',
    arrows: [{ side: 'iraq', path: [[48.14, 30.62], [48.3, 30.62], [48.42, 30.56], [48.33, 30.45]], label: 'Karun crossing' }],
    places: ['abadan', 'khorramshahr', 'darkhovin'], focus: [48.0, 30.2, 48.65, 30.85], refs: ['razoux', 'pollack'],
  },
  {
    id: 'morvarid', date: '1980-11-28', name: 'Operation Morvarid', fa: 'عملیات مروارید', kind: 'naval', side: 'iran', outcome: 'iran',
    summary: 'Iranian navy and air force destroy the Iraqi oil terminals at Mina al-Bakr and Khor al-Amaya and much of the Iraqi navy. Iraq\'s seaborne oil exports stop for the rest of the war.',
    wiki: 'Operation Morvarid',
    arrows: [{ side: 'iran', kind: 'naval', path: [[50.83, 28.95], [49.6, 29.3], [48.83, 29.68]], label: 'Mina al-Bakr' }],
    places: ['faw', 'kharg'], focus: [47.9, 28.6, 51.0, 30.4], refs: ['razoux', 'cordesman'],
  },

  // ── 1981 ────────────────────────────────────────────────────────────────────────
  {
    id: 'nasr', date: '1981-01-05', end: '1981-01-09', name: 'Operation Nasr (Hoveyzeh)', fa: 'عملیات نصر', kind: 'operation', side: 'iran', outcome: 'iraq',
    summary: 'President Banisadr\'s regular army sends an armoured division west from Hamidiyeh without infantry support. Iraqi armour catches it near Hoveyzeh in one of the war\'s largest tank battles; Iran loses well over a hundred tanks.',
    wiki: 'Operation Nasr',
    arrows: [
      { side: 'iran', path: [[48.45, 31.5], [48.28, 31.46], [48.12, 31.43]], label: 'Iranian armour' },
      { side: 'iraq', kind: 'counter', path: [[47.92, 31.3], [48.05, 31.38], [48.18, 31.44]] },
    ],
    places: ['hoveyzeh', 'hamidiyeh', 'susangerd'], refs: ['pollack', 'razoux'],
  },
  {
    id: 'banisadr', date: '1981-06-21', name: 'Banisadr impeached', kind: 'political', side: 'iran',
    summary: 'Parliament removes President Banisadr. Command passes to a cooperation between the regular army and the Revolutionary Guards, who combine infantry assaults with army fire support.',
    wiki: 'Abolhassan Banisadr', places: ['tehran'], refs: ['razoux'],
  },
  {
    id: 'thamen', date: '1981-09-27', end: '1981-09-29', name: 'Operation Thamen-ol-A\'emeh', fa: 'عملیات ثامن‌الائمه', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Converging attacks from Darkhovin, from Abadan and along the Mahshahr road destroy the Iraqi bridgehead east of the Karun. The siege of Abadan is broken.',
    wiki: 'Operation Samen-ol-A\'emeh',
    arrows: [
      { side: 'iran', path: [[48.45, 30.76], [48.4, 30.66], [48.33, 30.6]], label: 'From Darkhovin' },
      { side: 'iran', path: [[48.3, 30.38], [48.31, 30.47], [48.33, 30.54]], label: 'From Abadan' },
      { side: 'iran', path: [[48.52, 30.55], [48.44, 30.56], [48.38, 30.58]] },
      { side: 'iraq', kind: 'retreat', path: [[48.3, 30.6], [48.2, 30.62]] },
    ],
    places: ['abadan', 'darkhovin', 'khorramshahr'], focus: [48.05, 30.25, 48.65, 30.85], refs: ['razoux', 'murray-woods'],
  },
  {
    id: 'tariq', date: '1981-11-29', end: '1981-12-07', name: 'Operation Tariq al-Quds', fa: 'عملیات طریق‌القدس', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Revolutionary Guards and army units retake Bostan and push to the Chazabeh pass on the border, splitting the Iraqi forces in Khuzestan in two. It is the first big use of massed Guard infantry.',
    wiki: 'Operation Tariq al-Quds',
    arrows: [
      { side: 'iran', path: [[48.19, 31.6], [48.08, 31.7], [47.99, 31.72]], label: 'Bostan' },
      { side: 'iran', path: [[48.16, 31.86], [48.0, 31.83], [47.84, 31.8]], label: 'Chazabeh' },
      { side: 'iran', path: [[47.99, 31.72], [47.88, 31.64]] },
    ],
    places: ['bostan', 'susangerd'], focus: [47.6, 31.4, 48.4, 32.0], refs: ['razoux', 'murray-woods'],
  },

  // ── 1982 ────────────────────────────────────────────────────────────────────────
  {
    id: 'fath', date: '1982-03-22', end: '1982-03-30', name: 'Operation Fath ol-Mobin', fa: 'عملیات فتح‌المبین', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Night infiltration by Guard infantry, then army armour, on four axes west of Shush and Dezful. Several Iraqi divisions are broken and thousands captured; Iraqi artillery is pushed out of range of Dezful.',
    wiki: 'Operation Fath ol-Mobin',
    arrows: [
      { side: 'iran', path: [[48.3, 32.36], [48.1, 32.4], [47.85, 32.38]], label: 'Ein Khosh' },
      { side: 'iran', path: [[48.25, 32.22], [48.0, 32.25], [47.75, 32.22]] },
      { side: 'iran', path: [[48.25, 32.06], [48.0, 32.08], [47.75, 32.08]], label: 'Fakkeh' },
      { side: 'iran', path: [[48.2, 31.95], [47.95, 31.95]], label: 'Chenaneh' },
      { side: 'iraq', kind: 'retreat', path: [[47.75, 32.15], [47.5, 32.16]] },
    ],
    places: ['dezful', 'shush', 'andimeshk', 'fakkeh'], focus: [47.35, 31.75, 48.55, 32.6], refs: ['razoux', 'murray-woods', 'pollack'],
  },
  {
    id: 'beit', date: '1982-04-24', end: '1982-05-24', name: 'Operation Beit ol-Moqaddas', fa: 'عملیات بیت‌المقدس', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Iranian forces cross the Karun at night, cut the Ahvaz–Khorramshahr road, sweep to the border, then turn south. On 24 May Khorramshahr is liberated and around 19,000 Iraqis surrender — the turning point of the war.',
    wiki: 'Operation Beit ol-Moqaddas',
    arrows: [
      { side: 'iran', path: [[48.44, 30.8], [48.3, 30.82], [48.15, 30.85]], label: '1: Karun crossing' },
      { side: 'iran', path: [[48.55, 31.22], [48.35, 31.25], [48.1, 31.28], [47.9, 31.25]], label: '2: To the border' },
      { side: 'iran', path: [[47.98, 31.15], [47.97, 30.85], [47.99, 30.56]] },
      { side: 'iran', path: [[48.15, 30.85], [48.12, 30.65], [48.17, 30.47]], label: '3: Khorramshahr' },
      { side: 'iraq', kind: 'retreat', path: [[48.15, 30.45], [47.98, 30.5], [47.84, 30.52]] },
    ],
    places: ['khorramshahr', 'hoveyzeh', 'hamidiyeh', 'darkhovin', 'ahvaz', 'shalamcheh'], focus: [47.7, 30.25, 48.8, 31.6], refs: ['razoux', 'murray-woods', 'pollack'],
  },
  {
    id: 'withdrawal-1982', date: '1982-06-20', name: 'Saddam announces withdrawal', kind: 'political', side: 'iraq',
    summary: 'Saddam declares Iraqi forces will leave Iranian territory and offers a ceasefire. Tehran rejects it, demanding reparations and Saddam\'s fall, and decides to invade Iraq.',
    wiki: 'Iran–Iraq War', places: ['baghdad', 'tehran'], refs: ['murray-woods', 'hiro'],
  },
  {
    id: 'ramadan', date: '1982-07-13', end: '1982-08-03', name: 'Operation Ramadan', fa: 'عملیات رمضان', kind: 'operation', side: 'iran', outcome: 'iraq',
    summary: 'Iran\'s first invasion of Iraq aims at Basra. Now defending its own soil, Iraq has rebuilt its army on the Soviet model: three lines of berms, minefields and bunkers, flooded ground, and tanks held back to counter-attack. Human-wave attacks break into the first line and are then caught by artillery, gunships and armour; the offensive stalls after heavy losses. This is Iraq\'s pattern for the next five years.',
    wiki: 'Operation Ramadan',
    arrows: [
      { side: 'iran', path: [[48.0, 30.52], [47.92, 30.55], [47.85, 30.52]], label: 'Shalamcheh axis' },
      { side: 'iran', path: [[47.92, 30.92], [47.86, 30.72], [47.84, 30.58]], label: 'Zeid axis' },
      { side: 'iraq', kind: 'counter', path: [[47.72, 30.62], [47.82, 30.7]] },
    ],
    places: ['basra', 'shalamcheh'], focus: [47.55, 30.3, 48.3, 31.05], refs: ['woods-saddam', 'murray-woods'],
  },
  {
    id: 'muslim', date: '1982-10-01', end: '1982-10-10', name: 'Operation Muslim ibn Aqil', fa: 'عملیات مسلم بن عقیل', kind: 'operation', side: 'iran', outcome: 'stalemate',
    summary: 'An attack from Sumar takes heights overlooking Mandali, about 110 km from Baghdad, but does not take the town.',
    wiki: 'Operation Muslim ibn Aqil',
    arrows: [{ side: 'iran', path: [[45.78, 33.96], [45.64, 33.86], [45.56, 33.77]], label: 'Mandali heights' }],
    places: ['sumar', 'mandali'], focus: [45.2, 33.5, 46.1, 34.2], refs: ['razoux'],
  },
  {
    id: 'moharram', date: '1982-11-01', end: '1982-11-07', name: 'Operation Moharram', fa: 'عملیات محرم', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Iran clears the remaining Iraqi positions around Musian and pushes onto the border hills near the Zubaidat oil field.',
    wiki: 'Operation Muharram',
    arrows: [
      { side: 'iran', path: [[47.45, 32.7], [47.38, 32.55], [47.25, 32.45]] },
      { side: 'iran', path: [[47.62, 32.6], [47.48, 32.47]] },
    ],
    places: ['musian', 'dehloran'], focus: [46.9, 32.25, 47.85, 32.85], refs: ['razoux'],
  },

  // ── 1983 ────────────────────────────────────────────────────────────────────────
  {
    id: 'before-dawn', date: '1983-02-06', end: '1983-02-16', name: 'Operation Before the Dawn', fa: 'عملیات والفجر مقدماتی', kind: 'operation', side: 'iran', outcome: 'iraq',
    summary: 'An offensive across the Fakkeh sands toward the Amarah–Basra road. Iraqi defences in depth hold, and Iran takes heavy losses for little ground.',
    wiki: 'Operation Before the Dawn',
    arrows: [
      { side: 'iran', path: [[47.78, 32.0], [47.56, 31.94], [47.36, 31.9]], label: 'Toward Amarah' },
      { side: 'iraq', kind: 'counter', path: [[47.25, 31.95], [47.45, 31.96]] },
    ],
    places: ['fakkeh', 'amarah'], focus: [47.0, 31.6, 48.1, 32.3], refs: ['razoux', 'murray-woods'],
  },
  {
    id: 'dawn1', date: '1983-04-10', end: '1983-04-17', name: 'Operation Dawn 1', fa: 'عملیات والفجر ۱', kind: 'operation', side: 'iran', outcome: 'stalemate',
    summary: 'A follow-up attack north of Fakkeh gains a few heights at high cost.',
    wiki: 'Operation Dawn 1',
    arrows: [{ side: 'iran', path: [[47.62, 32.3], [47.42, 32.25], [47.26, 32.16]] }],
    places: ['fakkeh', 'musian'], focus: [47.0, 31.9, 47.9, 32.6], refs: ['razoux'],
  },
  {
    id: 'dawn2', date: '1983-07-22', end: '1983-07-31', name: 'Operation Dawn 2 (Haj Omran)', fa: 'عملیات والفجر ۲', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Guided by Barzani\'s KDP peshmerga, Iranian forces seize the Haj Omran heights from Piranshahr — the first lasting Iranian foothold on Iraqi soil.',
    wiki: 'Operation Dawn 2',
    arrows: [{ side: 'iran', path: [[45.2, 36.76], [45.12, 36.71], [45.04, 36.68]], label: 'With KDP fighters' }],
    places: ['hajomran', 'piranshahr'], focus: [44.5, 36.35, 45.5, 36.95], refs: ['razoux', 'murray-woods'],
  },
  {
    id: 'dawn3', date: '1983-07-30', end: '1983-08-09', name: 'Operation Dawn 3 (Mehran)', fa: 'عملیات والفجر ۳', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Iran takes the heights around Mehran, making the town untenable for Iraq. Iraq answers with mustard gas, one of its first large chemical uses.',
    wiki: 'Operation Dawn 3',
    arrows: [{ side: 'iran', path: [[46.3, 33.22], [46.16, 33.12], [46.0, 33.02]] }],
    places: ['mehran', 'ilam'], focus: [45.7, 32.8, 46.6, 33.5], refs: ['razoux', 'cordesman'],
  },
  {
    id: 'dawn4', date: '1983-10-19', end: '1983-11-01', name: 'Operation Dawn 4 (Penjwen)', fa: 'عملیات والفجر ۴', kind: 'operation', side: 'iran', outcome: 'stalemate',
    summary: 'From Marivan, Iran takes the heights around Penjwen in Iraqi Kurdistan but not the town itself.',
    wiki: 'Operation Dawn 4',
    arrows: [{ side: 'iran', path: [[46.16, 35.54], [46.04, 35.6], [45.96, 35.62]] }],
    places: ['penjwen', 'marivan'], focus: [45.6, 35.3, 46.5, 35.9], refs: ['razoux'],
  },

  // ── 1984–85 ─────────────────────────────────────────────────────────────────────
  {
    id: 'kheibar', date: '1984-02-22', end: '1984-03-19', name: 'Operation Kheibar', fa: 'عملیات خیبر', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Guard infantry cross the Hawizeh marshes by boat and helicopter and seize the Majnoon Islands. A push on to the Basra–Baghdad highway is thrown back with mustard and tabun gas, but Iran keeps Majnoon until 1988.',
    wiki: 'Operation Kheibar',
    arrows: [
      { side: 'iran', kind: 'naval', path: [[47.78, 31.13], [47.65, 31.1], [47.55, 31.07]], label: 'By boat to Majnoon' },
      { side: 'iran', path: [[47.76, 31.36], [47.58, 31.3], [47.42, 31.24]], label: 'Toward the highway' },
      { side: 'iraq', kind: 'counter', path: [[47.3, 31.15], [47.45, 31.22]] },
    ],
    places: ['majnoon', 'qurna', 'basra'], focus: [47.2, 30.85, 48.0, 31.55], refs: ['razoux', 'cordesman', 'murray-woods'],
  },
  {
    id: 'tanker-war', date: '1984-03-27', end: '1988-07-20', name: 'Tanker War begins', fa: 'جنگ نفتکش‌ها', kind: 'air', side: 'iraq',
    summary: 'Unable to win on the ground, Iraq turns its rebuilt air force on Iran\'s oil: Kharg Island, the main export terminal, and any ship trading with Iranian ports. Part of the aim is to provoke Iran into closing the Strait of Hormuz and so bring in the Americans. Iran instead hits tankers carrying Iraqi oil from Kuwait and Saudi Arabia — first on 13 May 1984 — and moves its exports south to Larak Island. Lloyd\'s later counted 546 ships damaged and about 430 sailors killed; Iraq made three times as many attacks as Iran.',
    wiki: 'Tanker War',
    arrows: [{ side: 'iraq', kind: 'air', path: [BAGHDAD, [48.0, 31.0], [50.3, 29.28]], label: 'Kharg Island' }],
    places: ['kharg'], focus: [44.0, 28.4, 51.6, 33.6], refs: ['cordesman', 'razoux'],
  },
  {
    id: 'cities-1985', date: '1985-03-04', end: '1985-06-14', name: 'War of the Cities (1985)', fa: 'جنگ شهرها', kind: 'air', side: 'both',
    summary: 'Iraqi aircraft bomb Tehran and other cities; Iran fires Scud missiles bought from Libya at Baghdad. Civilians on both sides become targets.',
    wiki: 'War of the Cities',
    arrows: [
      { side: 'iraq', kind: 'air', path: [BAGHDAD, [48.0, 35.2], TEHRAN], label: 'Tehran' },
      { side: 'iran', kind: 'missile', path: [[47.0, 34.3], [45.6, 34.0], BAGHDAD], label: 'Scud' },
    ],
    places: ['tehran', 'baghdad'], focus: [44.0, 32.5, 52.0, 36.4], refs: ['cordesman'],
  },
  {
    id: 'badr', date: '1985-03-11', end: '1985-03-20', name: 'Operation Badr', fa: 'عملیات بدر', kind: 'operation', side: 'iran', outcome: 'iraq',
    summary: 'Another marsh assault briefly cuts the Basra–Baghdad highway at the Tigris. Iraqi counter-attacks with armour, air power and gas drive Iran back to its start line.',
    wiki: 'Operation Badr (1985)',
    arrows: [
      { side: 'iran', kind: 'naval', path: [[47.78, 31.38], [47.58, 31.33], [47.4, 31.3]], label: 'Across the Hawizeh' },
      { side: 'iraq', kind: 'counter', path: [[47.25, 31.18], [47.38, 31.3]] },
      { side: 'iraq', kind: 'counter', path: [[47.22, 31.48], [47.38, 31.36]] },
    ],
    places: ['qurna', 'majnoon', 'amarah'], focus: [47.0, 30.9, 48.0, 31.75], refs: ['razoux', 'murray-woods'],
  },

  // ── 1986 ────────────────────────────────────────────────────────────────────────
  {
    id: 'dawn8', date: '1986-02-09', end: '1986-02-25', name: 'Operation Dawn 8 (al-Faw)', fa: 'عملیات والفجر ۸', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Frogmen and assault boats cross the wide Shatt al-Arab at night in rain, surprising the Iraqi defenders. Iran takes Faw and holds it against weeks of counter-attacks, putting Kuwait and Basra\'s sea access under threat.',
    wiki: 'Operation Dawn 8',
    arrows: [
      { side: 'iran', kind: 'naval', path: [[48.42, 30.12], [48.44, 30.05], [48.47, 29.98]], label: 'Shatt crossing' },
      { side: 'iran', kind: 'naval', path: [[48.33, 30.22], [48.3, 30.18]] },
      { side: 'iran', path: [[48.4, 30.04], [48.25, 30.12], [48.15, 30.12]], label: 'Toward Umm Qasr' },
      { side: 'iraq', kind: 'counter', path: [[47.98, 30.24], [48.12, 30.18]] },
      { side: 'iraq', kind: 'counter', path: [[47.95, 30.06], [48.1, 30.08]] },
    ],
    places: ['faw', 'abadan', 'ummqasr', 'basra'], focus: [47.75, 29.75, 48.75, 30.55], refs: ['razoux', 'murray-woods', 'woods-saddam'],
  },
  {
    id: 'mehran-1986', date: '1986-05-15', end: '1986-05-19', name: 'Iraq takes Mehran ("Dynamic Defence")', ar: 'الدفاع المتحرك', kind: 'battle', side: 'iraq', outcome: 'iraq',
    summary: 'Answering the loss of Faw, Saddam announces an offensive policy he calls "Dynamic Defence". Iraq\'s II Corps, with helicopter gunships, takes Mehran — for the third time in the war — and Baghdad offers to swap it for Faw. Iran refuses; Iraqi attempts to push deeper are broken up by Iranian Cobra helicopters with TOW missiles.',
    wiki: 'Battle of Mehran',
    arrows: [{ side: 'iraq', path: [[45.92, 32.98], [46.06, 33.06], [46.2, 33.14]], label: 'II Corps' }],
    places: ['mehran', 'badra'], focus: [45.75, 32.85, 46.55, 33.45], refs: ['razoux', 'murray-woods'],
  },
  {
    id: 'karbala1', date: '1986-06-30', end: '1986-07-09', name: 'Operation Karbala-1', fa: 'عملیات کربلای ۱', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Iran recaptures Mehran and the heights around it within days. Saddam sends the Republican Guard to retake it on 4 July; the attack fails with heavy losses, and Iraq cannot mount another major offensive for almost two years.',
    wiki: 'Operation Karbala-1',
    arrows: [
      { side: 'iran', path: [[46.36, 33.26], [46.2, 33.15], [46.02, 33.05]] },
      { side: 'iraq', kind: 'counter', path: [[45.88, 32.96], [46.06, 33.05]], label: 'Republican Guard' },
    ],
    places: ['mehran'], focus: [45.75, 32.85, 46.55, 33.45], refs: ['razoux'],
  },
  {
    id: 'karbala4', date: '1986-12-24', end: '1986-12-26', name: 'Operation Karbala-4', fa: 'عملیات کربلای ۴', kind: 'operation', side: 'iran', outcome: 'iraq',
    summary: 'A night crossing of the Shatt toward Abu al-Khasib and Umm al-Rassas island is detected and shattered within two days.',
    wiki: 'Operation Karbala-4',
    arrows: [{ side: 'iran', kind: 'naval', path: [[48.18, 30.38], [48.07, 30.42], [47.98, 30.45]] }],
    places: ['khorramshahr', 'basra'], focus: [47.75, 30.2, 48.45, 30.65], refs: ['razoux'],
  },

  // ── 1987 ────────────────────────────────────────────────────────────────────────
  {
    id: 'karbala5', date: '1987-01-09', end: '1987-02-26', name: 'Operation Karbala-5', fa: 'عملیات کربلای ۵', kind: 'operation', side: 'iran', outcome: 'stalemate',
    summary: 'Iran\'s biggest assault on Basra fights through Fish Lake\'s fortified lines from Shalamcheh and gets within about 12 km of the city. Iraq throws in every heavy weapon and, from mid-January, its full air force — over 500 sorties in two days — and although Iran breaks through four defence lines, it is stopped about 15 km from the city. Losses are enormous on both sides; the area becomes known as the "Somme" of the war.',
    wiki: 'Operation Karbala-5',
    arrows: [
      { side: 'iran', path: [[48.03, 30.56], [47.98, 30.58], [47.93, 30.56]], label: 'Fish Lake' },
      { side: 'iran', path: [[48.03, 30.46], [47.97, 30.47], [47.92, 30.49]], label: 'Jassim river' },
      { side: 'iraq', kind: 'counter', path: [[47.82, 30.5], [47.9, 30.5]] },
      { side: 'iraq', kind: 'air', path: [[47.3, 30.9], [47.7, 30.75], [47.98, 30.55]], label: 'Air support' },
    ],
    places: ['basra', 'shalamcheh', 'khorramshahr'], focus: [47.7, 30.3, 48.25, 30.75], refs: ['razoux', 'murray-woods'],
  },
  {
    id: 'nasr4', date: '1987-06-21', name: 'Operation Nasr 4', fa: 'عملیات نصر ۴', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'With PUK fighters, Iran advances from Baneh toward Mawat in Iraqi Kurdistan. Baghdad responds with the Anfal campaign against Kurdish villages.',
    wiki: 'Operation Nasr 4',
    arrows: [{ side: 'iran', path: [[45.82, 35.98], [45.62, 35.95], [45.43, 35.9]], label: 'With PUK fighters' }],
    places: ['baneh', 'mawat', 'sulaymaniyah'], focus: [45.1, 35.6, 46.1, 36.2], refs: ['razoux', 'hrw-anfal'],
  },
  {
    id: 'res598', date: '1987-07-20', name: 'UN Security Council Resolution 598', fa: 'قطعنامه ۵۹۸', kind: 'political',
    summary: 'The Security Council unanimously demands an immediate ceasefire and withdrawal to internationally recognised borders. Iraq accepts; Iran stalls for a year.',
    wiki: 'United Nations Security Council Resolution 598', places: ['tehran', 'baghdad'], refs: ['unsc-598'],
  },

  // ── 1988 ────────────────────────────────────────────────────────────────────────
  {
    id: 'anfal', date: '1988-02-23', end: '1988-09-06', name: 'Anfal campaign', kind: 'atrocity', side: 'iraq',
    summary: 'Iraqi forces systematically destroy Kurdish villages and kill tens of thousands of civilians, many with chemical weapons, in areas where Kurdish fighters worked with Iran.',
    wiki: 'Anfal campaign', places: ['sulaymaniyah', 'halabja', 'kirkuk'], focus: [43.8, 34.8, 46.4, 37.1], refs: ['hrw-anfal'],
  },
  {
    id: 'cities-1988', date: '1988-02-29', end: '1988-04-20', name: 'War of the Cities (1988)', fa: 'جنگ شهرها', kind: 'air', side: 'both',
    summary: 'Iraq fires around 190 extended-range Scuds (al-Hussein) at Tehran, Qom and Isfahan; a large share of Tehran\'s population flees the city. Iran fires its own Scuds at Baghdad.',
    wiki: 'War of the Cities',
    arrows: [
      { side: 'iraq', kind: 'missile', path: [[44.2, 33.6], [47.9, 35.4], TEHRAN], label: 'al-Hussein' },
      { side: 'iran', kind: 'missile', path: [[47.0, 34.3], [45.6, 34.0], BAGHDAD] },
    ],
    places: ['tehran', 'baghdad'], focus: [44.0, 32.5, 52.0, 36.4], refs: ['cordesman', 'razoux'],
  },
  {
    id: 'dawn10', date: '1988-03-15', end: '1988-03-20', name: 'Operation Dawn 10 (Halabja)', fa: 'عملیات والفجر ۱۰', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'Iran and the PUK take Halabja and Khurmal and approach the Darbandikhan dam — Iran\'s deepest gains in the north.',
    wiki: 'Operation Dawn 10',
    arrows: [
      { side: 'iran', path: [[46.32, 35.25], [46.15, 35.21], [45.99, 35.18]], label: 'Halabja' },
      { side: 'iran', path: [[46.25, 35.38], [46.08, 35.32], [45.98, 35.28]] },
    ],
    places: ['halabja', 'marivan'], focus: [45.5, 34.95, 46.5, 35.6], refs: ['razoux'],
  },
  {
    id: 'halabja', date: '1988-03-16', name: 'Halabja chemical attack', fa: 'بمباران شیمیایی حلبچه', kind: 'atrocity', side: 'iraq',
    summary: 'Iraqi aircraft drop mustard gas and nerve agents on Halabja, killing an estimated 3,200–5,000 Kurdish civilians — the deadliest chemical attack on civilians in history.',
    wiki: 'Halabja massacre',
    arrows: [{ side: 'iraq', kind: 'air', path: [[44.39, 35.47], [45.3, 35.45], [45.99, 35.18]], label: 'From Kirkuk' }],
    places: ['halabja', 'kirkuk'], focus: [44.2, 34.9, 46.5, 35.8], refs: ['hrw-anfal'],
  },
  {
    id: 'faw-2', date: '1988-04-17', end: '1988-04-18', name: 'Operation Ramadan Mubarak (Second Battle of al-Faw)', ar: 'رمضان مبارك', kind: 'operation', side: 'iraq', outcome: 'iraq',
    summary: 'Planned in secret for two years by a handful of officers with Saddam, and rehearsed on full-size mock-ups in the desert: over 100,000 troops, about 60% Republican Guard, against some 15,000 Iranian volunteers. Diversionary attacks in the north, then a barrage of nerve and mustard gas, heliborne commandos behind the lines and an amphibious hook. Faw falls in a day and a half — the first of the "Tawakalna ala Allah" victories.',
    wiki: 'Second Battle of al-Faw',
    arrows: [
      { side: 'iraq', path: [[48.02, 30.2], [48.22, 30.1], [48.42, 29.98]], label: 'VII Corps' },
      { side: 'iraq', path: [[48.22, 30.26], [48.35, 30.15], [48.46, 30.0]], label: 'Republican Guard' },
      { side: 'iraq', kind: 'naval', path: [[47.98, 29.95], [48.2, 29.92], [48.38, 29.95]], label: 'Amphibious hook' },
    ],
    places: ['faw', 'ummqasr'], focus: [47.75, 29.75, 48.75, 30.45], refs: ['woods-saddam', 'murray-woods', 'razoux'],
  },
  {
    id: 'tawakalna1', date: '1988-05-25', name: 'Tawakalna ala Allah 1: Fish Lake & Shalamcheh', ar: 'توكلنا على الله ١', kind: 'operation', side: 'iraq', outcome: 'iraq',
    summary: 'One of the largest artillery barrages in history, with gas, opens a 15-mile attack by the Republican Guard and III Corps. The marshes have dried, so Iraqi tanks bypass the Iranian fieldworks; in under ten hours the ground Iran paid for in Karbala-5 is gone and Iran is pushed back over the border.',
    wiki: 'Tawakalna ala Allah Operations',
    arrows: [
      { side: 'iraq', path: [[47.88, 30.52], [47.97, 30.52], [48.05, 30.52]] },
      { side: 'iraq', path: [[47.9, 30.64], [48.0, 30.59]] },
    ],
    places: ['shalamcheh', 'basra'], focus: [47.7, 30.3, 48.3, 30.75], refs: ['woods-saddam', 'murray-woods'],
  },
  {
    id: 'forty-stars', date: '1988-06-18', end: '1988-06-21', name: 'Operation Forty Stars', fa: 'عملیات چلچراغ', kind: 'operation', side: 'other', outcome: 'iraq',
    summary: 'The People\'s Mujahedin (MEK), armed and supported by Iraq, takes Mehran and withdraws with captured equipment.',
    wiki: 'Operation Forty Stars',
    arrows: [{ side: 'other', path: [[45.85, 33.0], [46.04, 33.08], [46.16, 33.12]], label: 'MEK' }],
    places: ['mehran'], focus: [45.75, 32.85, 46.55, 33.45], refs: ['razoux'],
  },
  {
    id: 'majnoon-retaken', date: '1988-06-25', name: 'Tawakalna ala Allah 2: Majnoon', ar: 'توكلنا على الله ٢', kind: 'operation', side: 'iraq', outcome: 'iraq',
    summary: 'After rehearsing on mock-ups of the islands, the Republican Guard crosses by amphibious vehicles and boats at 3:30 a.m. behind a gas barrage, throws pontoon bridges over and clears both islands in about eight hours while III Corps and hovercraft commandos cut them off from the mainland.',
    wiki: 'Tawakalna ala Allah Operations',
    arrows: [
      { side: 'iraq', path: [[47.4, 31.0], [47.53, 31.05], [47.66, 31.1]] },
      { side: 'iraq', kind: 'naval', path: [[47.42, 31.25], [47.58, 31.2]], label: 'Amphibious' },
      { side: 'iraq', path: [[47.62, 30.88], [47.75, 30.98], [47.78, 31.1]], label: 'III Corps' },
    ],
    places: ['majnoon', 'qurna'], focus: [47.2, 30.85, 47.95, 31.4], refs: ['woods-saddam'],
  },
  {
    id: 'ir655', date: '1988-07-03', name: 'Iran Air Flight 655', kind: 'atrocity', side: 'other',
    summary: 'The USS Vincennes shoots down an Iranian airliner over the Strait of Hormuz (off this map), killing all 290 aboard. In Tehran it reinforces the sense that the war cannot be won.',
    wiki: 'Iran Air Flight 655', places: ['tehran'], refs: ['razoux'],
  },
  {
    id: 'iran-accepts', date: '1988-07-18', name: 'Iran accepts Resolution 598', kind: 'political', side: 'iran',
    summary: 'Iran accepts the UN ceasefire. Two days later Khomeini says accepting it is "more deadly than drinking poison".',
    wiki: 'United Nations Security Council Resolution 598', places: ['tehran'], refs: ['unsc-598', 'razoux'],
  },
  {
    id: 'tawakalna34', date: '1988-07-12', end: '1988-07-13', name: 'Tawakalna ala Allah 3 & 4: back into Iran', ar: 'توكلنا على الله ٣–٤', kind: 'operation', side: 'iraq', outcome: 'iraq',
    summary: 'About five divisions, Republican Guard and IV Corps, overrun Iran\'s last positions on Iraqi soil at the Zubaidat oil fields east of Amarah within hours, then keep going. From Amarah they take Musian and Dehloran; from Khanaqin they take Naft-e Shahr, Sumar, Qasr-e Shirin and Sarpol-e Zahab. Thousands of Iranian prisoners and much armour are captured. The aim is to force Tehran to accept the UN ceasefire.',
    wiki: 'Tawakalna ala Allah Operations',
    arrows: [
      { side: 'iraq', path: [[47.05, 32.38], [47.2, 32.5], [47.27, 32.67]], label: 'IV Corps: Dehloran' },
      { side: 'iraq', path: [[47.15, 32.3], [47.38, 32.5]], label: 'Musian' },
      { side: 'iraq', path: [[45.36, 34.36], [45.58, 34.5], [45.84, 34.45]], label: 'Qasr-e Shirin → Sarpol' },
      { side: 'iraq', path: [[45.3, 34.05], [45.48, 34.03]] },
      { side: 'iraq', path: [[45.3, 33.85], [45.62, 33.86]], label: 'Sumar' },
    ],
    places: ['dehloran', 'musian', 'amarah', 'qasreshirin', 'sarpolezahab', 'sumar', 'naftshahr', 'khanaqin'], focus: [45.0, 32.2, 47.9, 34.8], refs: ['woods-saddam', 'murray-woods'],
  },
  {
    id: 'iraq-july88', date: '1988-07-22', name: 'Last Iraqi thrust into Khuzestan', kind: 'operation', side: 'iraq', outcome: 'iraq',
    summary: 'Even after Iran accepts the ceasefire, Iraqi armour drives into Khuzestan, cuts the Ahvaz–Khorramshahr highway and reaches crossings on the Karkheh, taking more prisoners as bargaining chips. Baghdad then pulls back from the towns, saying it has no wish to hold Iranian land.',
    wiki: 'Tawakalna ala Allah Operations',
    arrows: [
      { side: 'iraq', path: [[47.6, 31.3], [47.95, 31.28], [48.2, 31.15], [48.35, 31.0]], label: 'Ahvaz–Khorramshahr road' },
      { side: 'iraq', path: [[47.75, 30.68], [48.05, 30.75], [48.3, 30.82]] },
      { side: 'iraq', path: [[47.65, 31.62], [47.95, 31.62], [48.15, 31.68]], label: 'Karkheh' },
    ],
    places: ['hoveyzeh', 'ahvaz', 'khorramshahr', 'susangerd'], focus: [47.4, 30.4, 48.8, 31.9], refs: ['woods-saddam', 'murray-woods'],
  },
  {
    id: 'mersad', date: '1988-07-26', end: '1988-07-29', name: 'Forough Javidan & Operation Mersad', fa: 'عملیات مرصاد', kind: 'operation', side: 'iran', outcome: 'iran',
    summary: 'An MEK army of several thousand drives from Qasr-e Shirin through Sarpol-e Zahab and Eslamabad toward Kermanshah. Iran blocks it at the Charzebar pass and cuts it off from the flanks; the column is destroyed.',
    wiki: 'Operation Mersad',
    arrows: [
      { side: 'other', path: [[45.42, 34.52], [45.86, 34.46], [46.15, 34.28], [46.53, 34.11], [46.72, 34.18]], label: 'MEK column' },
      { side: 'iran', kind: 'counter', path: [[47.0, 34.3], [46.76, 34.2]], label: 'Charzebar pass' },
      { side: 'iran', kind: 'counter', path: [[45.95, 33.98], [46.22, 34.08], [46.4, 34.12]] },
    ],
    places: ['qasreshirin', 'sarpolezahab', 'eslamabad', 'kermanshah'], focus: [45.2, 33.8, 47.3, 34.7], refs: ['razoux'],
  },
  {
    id: 'ceasefire', date: '1988-08-20', name: 'Ceasefire', fa: 'آتش‌بس', kind: 'political',
    summary: 'The guns fall silent. UNIIMOG observers deploy along roughly 1,400 km of front. Estimates of the dead run from several hundred thousand to over a million; the border is unchanged.',
    wiki: 'United Nations Iran–Iraq Military Observer Group', places: ['tehran', 'baghdad'], focus: [44.2, 29.9, 51.6, 37.5], refs: ['unsc-598', 'murray-woods'],
  },

  // ── Iraqi operations and defensive battles ───────────────────────────────────
  {
    id: 'enclaves-1980', date: '1980-09-10', name: 'Iraq seizes the border enclaves', kind: 'operation', side: 'iraq', outcome: 'iraq',
    summary: 'Before the invasion, Iraqi divisions take Zain al-Qaws near Khanaqin, Saif Saad, and a strip between Shib and Fakkeh — land the 1975 agreement had promised Iraq but never handed over. On 10 September Saddam declares all disputed territory "liberated"; a week later he tears up the agreement.',
    wiki: 'Iraqi invasion of Iran',
    arrows: [
      { side: 'iraq', path: [[45.36, 34.3], [45.46, 34.24], [45.53, 34.17]], label: 'Zain al-Qaws (6th Armd)' },
      { side: 'iraq', path: [[47.5, 32.28], [47.62, 32.18], [47.72, 32.1]], label: 'Shib–Fakkeh (1st Mech)' },
    ],
    places: ['khanaqin', 'naftshahr', 'fakkeh'], focus: [45.0, 31.8, 48.1, 34.6], refs: ['woods-saddam', 'razoux'],
  },
  {
    id: 'dezful-1980', date: '1980-10-14', end: '1980-10-16', name: 'Battle of Dezful', kind: 'battle', side: 'iran', outcome: 'iraq',
    summary: 'With Iraqi guns shelling Dezful, an Iranian armoured brigade and Revolutionary Guard infantry attack the Iraqi 10th Armoured Division. Its 42nd Armoured Brigade gives ground in good order onto a prepared killing area, and BMPs with Sagger missiles hit the Iranian tanks from the flank at 100–150 m. Iran abandons 84 tanks and dozens of other vehicles.',
    wiki: 'Operation Dezful',
    arrows: [
      { side: 'iran', path: [[48.36, 32.4], [48.22, 32.36], [48.08, 32.34]], label: 'Iranian 92nd Div.' },
      { side: 'iraq', kind: 'retreat', path: [[48.1, 32.34], [47.98, 32.33]] },
      { side: 'iraq', kind: 'counter', path: [[47.98, 32.47], [48.1, 32.39]], label: '24th Mech. Bde' },
      { side: 'iraq', kind: 'counter', path: [[47.98, 32.22], [48.09, 32.3]] },
    ],
    places: ['dezful', 'andimeshk', 'shush'], focus: [47.75, 32.05, 48.6, 32.6], refs: ['woods-saddam', 'pollack'],
  },
  {
    id: 'susangerd-1980', date: '1980-11-19', name: 'Susangerd: Iraqi encirclement broken', kind: 'battle', side: 'iran', outcome: 'iran',
    summary: 'In November Saddam orders his army to close on Dezful and Ahvaz, and Iraqi armour nearly encircles Susangerd — probably the first place Iraq used chemical weapons. On 19 November a joint army, Revolutionary Guard and irregular force, with heavy air support, breaks the ring. Short of reserves, Iraq\'s offensive is spent.',
    wiki: 'Liberation of Susangerd',
    arrows: [
      { side: 'iraq', path: [[47.98, 31.72], [48.1, 31.64], [48.17, 31.6]], label: 'From Bostan' },
      { side: 'iraq', path: [[48.06, 31.46], [48.14, 31.52], [48.18, 31.54]] },
      { side: 'iran', kind: 'counter', path: [[48.43, 31.5], [48.3, 31.54], [48.21, 31.56]], label: 'Relief force' },
    ],
    places: ['susangerd', 'bostan', 'hamidiyeh', 'hoveyzeh'], focus: [47.85, 31.35, 48.55, 31.8], refs: ['razoux', 'pollack'],
  },
  {
    id: 'iraq-defensive', date: '1980-12-07', name: 'Iraq goes on the defensive', kind: 'political', side: 'iraq',
    summary: 'With its strategic reserves used up, Saddam announces that Iraq will hold what it has taken. Iraqi tanks are dug into static positions and the war settles into trenches and artillery duels; Iraq begins firing missiles at Dezful and Ahvaz.',
    wiki: 'Iran–Iraq War', places: ['baghdad', 'dezful', 'ahvaz'], refs: ['murray-woods', 'woods-saddam'],
  },
  {
    id: 'majnoon-1986', date: '1986-01-06', name: 'Iraqi attack on Majnoon', kind: 'operation', side: 'iraq', outcome: 'stalemate',
    summary: 'For the first time in years Iraq attacks: it tries to retake the Majnoon Islands, bogs down against Iranian infantry and amphibious units, but gains a foothold on the southern island.',
    wiki: 'Iran–Iraq War',
    arrows: [{ side: 'iraq', path: [[47.4, 30.96], [47.52, 31.0], [47.6, 31.03]] }],
    places: ['majnoon', 'qurna'], focus: [47.2, 30.85, 47.95, 31.35], refs: ['murray-woods'],
  },
  {
    id: 'sardasht', date: '1987-06-28', name: 'Chemical bombing of Sardasht', fa: 'بمباران شیمیایی سردشت', kind: 'atrocity', side: 'iraq',
    summary: 'Iraqi aircraft drop mustard gas on four residential areas of Sardasht, an Iranian Kurdish town. 130 people die and about 8,000 are injured; many survivors are still sick decades later.',
    wiki: 'Chemical bombing of Sardasht',
    arrows: [{ side: 'iraq', kind: 'air', path: [[44.39, 35.47], [45.0, 36.0], [45.48, 36.15]], label: 'From Kirkuk' }],
    places: ['sardasht', 'kirkuk'], focus: [44.2, 35.2, 46.2, 36.6], refs: ['razoux'],
  },
  {
    id: 'shining-sun', date: '1988-03-28', name: 'Operation Shining Sun (MEK)', fa: 'عملیات آفتاب', kind: 'operation', side: 'other', outcome: 'iraq',
    summary: 'The first big attack by the MEK\'s "National Liberation Army", based in and armed by Iraq: it overruns Iranian positions in the Fakkeh sector astride the Dezful–Amarah road and takes prisoners and equipment (the MEK claimed 600 km²).',
    wiki: 'Operation Shining Sun',
    arrows: [{ side: 'other', path: [[47.55, 32.02], [47.75, 32.07], [47.95, 32.13]], label: 'MEK' }],
    places: ['fakkeh', 'shush', 'amarah'], focus: [47.2, 31.8, 48.4, 32.5], refs: ['razoux'],
  },

  // ── Raids and the war at sea ────────────────────────────────────────────────
  {
    id: 'h3', date: '1981-04-04', name: 'H-3 airstrike', fa: 'عملیات اچ۳', kind: 'air', side: 'iran', outcome: 'iran',
    summary: 'Iranian intelligence believed Iraq had moved its best aircraft to the H-3 bases in the far west, 1,000 km from Iran. Eight F-4E Phantoms from Hamadan, with F-14 escorts and in-flight refuelling, flew north to Lake Urmia, then west along the Turkish border below 100 m to dodge radar, and swung south onto the airfields — about 3,500 km in all. Iran claimed at least 48 aircraft destroyed with no losses; Iraq said only one MiG-21 was damaged. Either way it is one of the boldest raids of the war.',
    wiki: 'H-3 airstrike',
    arrows: [
      { side: 'iran', kind: 'air', route: true, path: [HAMADAN, [47.2, 36.4], [45.6, 37.65], [44.2, 37.25], [42.8, 37.12], [41.8, 36.55], [40.55, 33.83]], label: 'Low over the Turkish border', offMap: 'H-3 air bases' },
    ],
    places: ['kirkuk', 'baghdad'], focus: [40.4, 33.2, 46.2, 38.2], refs: ['razoux', 'cordesman'],
  },
  {
    id: 'opera', date: '1981-06-07', name: 'Israel bombs Osirak (Operation Opera)', kind: 'air', side: 'other',
    summary: 'Israeli F-16s destroy Iraq\'s unfinished French-built reactor near Baghdad — the same site Iranian Phantoms had damaged nine months earlier in Operation Scorch Sword. It ends Saddam\'s plutonium route to a bomb.',
    wiki: 'Operation Opera',
    arrows: [{ side: 'other', kind: 'air', path: [[40.55, 32.55], [42.4, 32.7], [44.52, 33.21]], label: 'From Israel' }],
    places: ['baghdad'], focus: [40.5, 31.8, 45.5, 34.2], refs: ['razoux'],
  },
  {
    id: 'cities-1984', date: '1984-02-07', end: '1984-02-22', name: 'First War of the Cities', fa: 'جنگ شهرها', kind: 'air', side: 'iraq',
    summary: 'Saddam orders his air force against eleven Iranian cities — the start of systematic strategic bombing in the war. Around 1,200 Iranian civilians are killed in February alone; Iran answers by shelling Basra and other border cities.',
    wiki: 'War of the Cities',
    arrows: [
      { side: 'iraq', kind: 'air', path: [BAGHDAD, [48.0, 35.3], TEHRAN], label: 'Tehran' },
      { side: 'iraq', kind: 'air', path: [BAGHDAD, [46.0, 34.5], [47.07, 34.31]], label: 'Kermanshah' },
      { side: 'iraq', kind: 'air', path: [[45.9, 32.5], [47.2, 32.0], [48.4, 32.38]], label: 'Dezful' },
      { side: 'iraq', kind: 'air', path: [[47.6, 30.6], [48.2, 30.8], [48.67, 31.32]], label: 'Ahvaz' },
      { side: 'iran', kind: 'missile', path: [[48.18, 30.5], [47.98, 30.55], [47.81, 30.51]], label: 'Shelling Basra' },
    ],
    places: ['tehran', 'kermanshah', 'dezful', 'ahvaz', 'basra'], focus: [44.0, 30.0, 52.0, 36.3], refs: ['cordesman', 'razoux'],
  },
  {
    id: 'earnest-will', date: '1987-07-24', end: '1988-09-26', name: 'Operation Earnest Will: US tanker convoys', kind: 'naval', side: 'other',
    summary: 'After Iranian speedboat attacks on its shipping, Kuwait asks foreign powers for protection. The Soviet Union charters tankers to Kuwait; the US reflags Kuwaiti tankers under the American flag and, from 24 July 1987, escorts them in the largest naval convoy operation since the Second World War. Ships carrying Iraqi and Kuwaiti oil are now protected; ships trading with Iran are not.',
    wiki: 'Operation Earnest Will',
    arrows: [{ side: 'other', kind: 'naval', path: [[48.2, 29.25], [49.3, 28.85], [50.3, 28.35]], label: 'Reflagged convoys', offMap: 'to Hormuz' }],
    places: ['kuwait', 'kharg'], focus: [47.4, 28.3, 51.4, 30.4], refs: ['cordesman', 'razoux'],
  },
  {
    id: 'stark', date: '1987-05-17', name: 'Iraqi missiles hit USS Stark', kind: 'naval', side: 'iraq',
    summary: 'An Iraqi Mirage F1 fires two Exocet missiles at the American frigate USS Stark in the Gulf, killing 37 sailors — still the only successful anti-ship missile strike on a US warship. Iraq calls it a mistake; why the pilot fired was never fully explained.',
    wiki: 'USS Stark incident',
    arrows: [{ side: 'iraq', kind: 'air', path: [[47.75, 30.4], [48.9, 29.6], [49.83, 28.35]], label: 'Mirage F1 + Exocets', offMap: 'USS Stark, off Bahrain' }],
    places: ['basra', 'kuwait'], focus: [47.2, 28.3, 51.0, 30.8], refs: ['cordesman'],
  },
  {
    id: 'airbases-1987', date: '1987-11-01', end: '1987-12-31', name: 'Iraqi blitz on Khuzestan air bases', kind: 'air', side: 'iraq', outcome: 'iran',
    summary: 'Iraq tries to finish off what is left of the Iranian air force by bombing its bases in Khuzestan. Iranian fighters, anti-aircraft guns and missiles shoot down about 30 Iraqi jets, and Iran\'s air force survives to the end of the war.',
    wiki: 'Iran–Iraq War',
    arrows: [
      { side: 'iraq', kind: 'air', path: [[46.6, 31.9], [47.6, 32.4], [48.4, 32.43]], label: 'Vahdati (Dezful)' },
      { side: 'iraq', kind: 'air', path: [[47.6, 30.5], [48.7, 30.4], [49.65, 30.78]], label: 'Omidiyeh' },
    ],
    places: ['dezful', 'ahvaz'], focus: [46.3, 29.9, 50.2, 32.9], refs: ['cordesman'],
  },
  {
    id: 'kharg-1988', date: '1988-03-18', name: 'Iraq\'s great Kharg Island raid', kind: 'air', side: 'iraq', outcome: 'iraq',
    summary: 'By now US warships track Iranian shipping and defences, and Iraq can strike deep into the Gulf. A massive raid on Kharg Island destroys two supertankers; Iraq loses five aircraft.',
    wiki: 'Kharg Island',
    arrows: [{ side: 'iraq', kind: 'air', path: [[47.6, 30.55], [49.0, 30.2], [50.31, 29.26]], label: 'Massed strike' }],
    places: ['kharg', 'basra'], focus: [47.2, 28.6, 51.2, 30.9], refs: ['cordesman', 'razoux'],
  },
  {
    id: 'praying-mantis', date: '1988-04-18', name: 'Operation Praying Mantis', kind: 'naval', side: 'other',
    summary: 'Four days after the frigate USS Samuel B. Roberts hits an Iranian mine, the US Navy strikes back in its largest surface battle since the Second World War. Two Iranian oil platforms, two frigates, a fast-attack craft and several armed boats are destroyed or damaged, in the southern Gulf (off this map). It falls on the same day Iraq retakes Faw, and pushes Tehran toward a ceasefire.',
    wiki: 'Operation Praying Mantis',
    arrows: [{ side: 'other', kind: 'naval', path: [[49.6, 28.9], [50.6, 28.6], [51.6, 28.35]], offMap: 'Sassan & Sirri platforms' }],
    places: ['kharg'], focus: [48.0, 28.3, 52.0, 30.2], refs: ['cordesman'],
  },
  {
    id: 'seawise-giant', date: '1988-05-14', name: 'Seawise Giant hit', kind: 'naval', side: 'iraq',
    summary: 'Iraqi jets fly the length of the Gulf to Larak Island in the Strait of Hormuz — Iran\'s new loading point, chosen because it was meant to be out of reach — and hit the Seawise Giant, the longest ship ever built, with Exocets as she lies at anchor loaded with Iranian crude.',
    wiki: 'Seawise Giant',
    arrows: [{ side: 'iraq', kind: 'air', path: [[47.7, 30.4], [49.9, 29.6], [51.95, 28.65]], label: 'Long-range strike', offMap: 'Larak Island, Hormuz' }],
    places: ['kharg', 'basra'], focus: [47.2, 28.3, 52.0, 30.8], refs: ['cordesman'],
  },
  {
    id: 'palace-1988', date: '1988-06-13', name: 'Iranian jets strike Saddam\'s palace', kind: 'air', side: 'iran',
    summary: 'In Iran\'s last counter-offensive of the war, Revolutionary Guards push about 10 km into Iraq while Iranian fighters reach Baghdad and hit Saddam\'s presidential palace. Within three days Iraq — with some 650 helicopter and 300 aircraft sorties — has driven the attack back.',
    wiki: 'Iran–Iraq War',
    arrows: [{ side: 'iran', kind: 'air', path: [HAMADAN, [46.4, 34.5], BAGHDAD], label: 'Presidential palace' }],
    places: ['baghdad'], focus: [43.8, 32.6, 49.0, 35.5], refs: ['razoux', 'murray-woods'],
  },

  // ── After ───────────────────────────────────────────────────────────────────────
  {
    id: 'withdrawal-1990', date: '1990-08-15', name: 'Saddam accepts the 1975 border', kind: 'political', side: 'iraq',
    summary: 'Two weeks after invading Kuwait, Saddam writes to Rafsanjani accepting the Algiers Agreement, withdraws from remaining Iranian territory and begins exchanging prisoners. The gains of eight years are given up overnight.',
    wiki: 'Iran–Iraq relations', places: ['baghdad', 'tehran', 'kuwait'], refs: ['hiro', 'razoux'],
  },
  {
    id: 'invasion-2003', date: '2003-03-20', name: 'US-led invasion of Iraq', kind: 'political', side: 'other',
    summary: 'Saddam\'s government falls. Relations between Tehran and Baghdad are transformed, and the last questions over war prisoners and missing persons are taken up by the new governments.',
    wiki: '2003 invasion of Iraq', places: ['baghdad'], refs: ['razoux'],
  },
];
