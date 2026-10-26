import type { Phase } from '../types';

// Control snapshots. Each holds until the next one's date.
export const PHASES: Phase[] = [
  {
    id: 'treaty-1937', date: '1937-07-04', label: '1937 frontier treaty', border: '1937',
    iraqHeld: [], iranHeld: [], contested: [],
    note: 'The river border runs along the Iranian (eastern) bank of the Shatt al-Arab, not mid-channel, except for a few kilometres off Abadan. The whole waterway is Iraqi.',
  },
  {
    id: 'abrogation', date: '1969-04-19', label: 'Iran rejects the 1937 line', border: '1937',
    iraqHeld: [], iranHeld: [], contested: [],
    note: 'Iran declares the 1937 treaty void and sails the Shatt under its own flag; Iraq still claims the 1937 line.',
  },
  {
    id: 'algiers', date: '1975-03-06', label: 'Algiers Agreement',
    iraqHeld: [], iranHeld: [], contested: [],
    note: 'Border fixed on the Shatt al-Arab thalweg. The line on this map is still the legal border today.',
  },
  {
    id: 'revolution', date: '1979-02-11', label: 'After the Revolution',
    iraqHeld: [], iranHeld: [], contested: ['kurdistan-irn'],
    note: 'Central authority collapses in Iranian Kurdistan; the army is purged and weakened.',
  },
  {
    id: 'invasion-max', date: '1980-11-01', label: 'Iraqi advance at its height',
    iraqHeld: ['khuz-karun-bridgehead', 'khuz-south', 'khuz-bostan', 'khuz-karkheh', 'musian', 'mehran', 'central-1980'], iranHeld: [], contested: ['kurdistan-irn'],
    note: 'Khorramshahr has fallen, Abadan is besieged, and Iraqi guns reach Dezful and Ahvaz.',
  },
  {
    id: 'after-thamen', date: '1981-09-29', label: 'Siege of Abadan broken',
    iraqHeld: ['khuz-south', 'khuz-bostan', 'khuz-karkheh', 'musian', 'mehran', 'central-1980'], iranHeld: [], contested: ['kurdistan-irn'],
    note: 'The Iraqi bridgehead east of the Karun is destroyed.',
  },
  {
    id: 'after-tariq', date: '1981-12-07', label: 'Bostan liberated',
    iraqHeld: ['khuz-south', 'khuz-karkheh', 'musian', 'mehran', 'central-1980'], iranHeld: [], contested: ['kurdistan-irn'],
    note: 'The Iraqi front is cut in two.',
  },
  {
    id: 'after-fath', date: '1982-03-30', label: 'After Fath ol-Mobin',
    iraqHeld: ['khuz-south', 'musian', 'mehran', 'central-1980'], iranHeld: [], contested: ['kurdistan-irn'],
    note: 'Dezful and Shush are out of artillery range; the Iraqi northern Khuzestan front collapses.',
  },
  {
    id: 'after-beit', date: '1982-05-24', label: 'Khorramshahr liberated',
    iraqHeld: ['musian', 'mehran', 'central-1980'], iranHeld: [], contested: ['kurdistan-irn'],
    note: 'Iranian forces reach the border along most of Khuzestan.',
  },
  {
    id: 'iraq-withdraws', date: '1982-06-30', label: 'Iraq pulls back to the border',
    iraqHeld: ['musian'], iranHeld: [], contested: ['kurdistan-irn', 'mehran', 'central-enclave'],
    note: 'Saddam announces a withdrawal; Iraqi units stay on some border heights. Iran decides to carry the war into Iraq.',
  },
  {
    id: 'after-moharram', date: '1982-11-07', label: 'After Moharram',
    iraqHeld: [], iranHeld: [], contested: ['kurdistan-irn', 'mehran', 'central-enclave'],
    note: 'The Musian strip is cleared.',
  },
  {
    id: 'after-valfajr2', date: '1983-08-01', label: 'Haj Omran taken',
    iraqHeld: [], iranHeld: ['hajomran'], contested: ['kurdistan-irn', 'mehran', 'central-enclave'],
    note: 'Iran\'s first durable foothold inside Iraq, in the Kurdish north.',
  },
  {
    id: 'after-valfajr4', date: '1983-11-01', label: 'Penjwen heights',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen'], contested: ['kurdistan-irq', 'mehran', 'central-enclave'],
    note: 'Iranian Kurdistan is largely back under Tehran; Iraqi Kurdistan\'s highlands are now the contested zone.',
  },
  {
    id: 'after-kheibar', date: '1984-03-15', label: 'Majnoon Islands taken',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'majnoon'], contested: ['kurdistan-irq', 'mehran', 'central-enclave', 'hawizeh'],
    note: 'Iran holds the Majnoon oil field; the marshes become a front of their own.',
  },
  {
    id: 'after-valfajr8', date: '1986-02-25', label: 'Al-Faw taken',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'majnoon', 'faw'], contested: ['kurdistan-irq', 'mehran', 'central-enclave', 'hawizeh'],
    note: 'Iraq is cut off from the Gulf at Faw; Kuwait is within sight of Iranian guns.',
  },
  {
    id: 'iraq-mehran', date: '1986-05-17', label: 'Iraq takes Mehran',
    iraqHeld: ['mehran'], iranHeld: ['hajomran', 'penjwen', 'majnoon', 'faw'], contested: ['kurdistan-irq', 'central-enclave', 'hawizeh'],
    note: 'Saddam\'s "dynamic defence": seize Iranian ground to trade for Faw.',
  },
  {
    id: 'after-karbala1', date: '1986-07-03', label: 'Mehran retaken',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'majnoon', 'faw'], contested: ['kurdistan-irq', 'central-enclave', 'hawizeh'],
    note: 'Karbala-1 restores the line.',
  },
  {
    id: 'after-karbala5', date: '1987-02-26', label: 'At the gates of Basra',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'majnoon', 'faw', 'basra-east'], contested: ['kurdistan-irq', 'central-enclave', 'hawizeh'],
    note: 'Iran\'s costliest offensive gets within ~12 km of Basra but cannot break through.',
  },
  {
    id: 'after-valfajr10', date: '1988-03-20', label: 'Halabja',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'majnoon', 'faw', 'basra-east', 'halabja'], contested: ['kurdistan-irq', 'central-enclave', 'hawizeh'],
    note: 'Iran\'s furthest reach into Iraq — and the chemical massacre of Halabja.',
  },
  {
    id: 'faw-retaken', date: '1988-04-18', label: 'Faw retaken',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'majnoon', 'basra-east', 'halabja'], contested: ['kurdistan-irq', 'central-enclave', 'hawizeh'],
    note: 'Iraq retakes Faw in about 35 hours, using chemical weapons on a large scale.',
  },
  {
    id: 'shalamcheh-retaken', date: '1988-05-25', label: 'Shalamcheh retaken',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'majnoon', 'halabja'], contested: ['kurdistan-irq', 'central-enclave', 'hawizeh'],
    note: 'Tawakalna ala Allah 1 pushes Iran back over the border east of Basra.',
  },
  {
    id: 'majnoon-retaken', date: '1988-06-25', label: 'Majnoon retaken',
    iraqHeld: [], iranHeld: ['hajomran', 'penjwen', 'halabja'], contested: ['kurdistan-irq', 'central-enclave'],
    note: 'Iran\'s hold in the south is gone.',
  },
  {
    id: 'iraq-into-iran', date: '1988-07-13', label: 'Iraq back inside Iran',
    iraqHeld: ['1988-dehloran', '1988-central'], iranHeld: ['hajomran'], contested: ['kurdistan-irq', 'halabja'],
    note: 'Tawakalna 3 & 4 clear Iran from Iraqi soil and seize Dehloran, Musian, Sumar, Naft-e Shahr, Qasr-e Shirin and Sarpol-e Zahab.',
  },
  {
    id: 'iraq-july88', date: '1988-07-25', label: 'Last Iraqi offensives',
    iraqHeld: ['1988-dehloran', '1988-central', '1988-khuz'], iranHeld: ['hajomran'], contested: ['kurdistan-irq', '1988-mersad', 'halabja'],
    note: 'After Iran accepts Resolution 598, Iraq strikes into Iran one more time and the MEK drives on Kermanshah.',
  },
  {
    id: 'ceasefire', date: '1988-08-20', label: 'Ceasefire',
    iraqHeld: [], iranHeld: ['hajomran'], contested: ['kurdistan-irq', 'central-enclave'],
    note: 'UN observers (UNIIMOG) deploy on the line of contact. Both sides still hold pockets across the border; the central belt is shown gray because its extent is uncertain.',
  },
  {
    id: 'withdrawal', date: '1990-08-17', label: 'Back to the 1975 border',
    iraqHeld: [], iranHeld: [], contested: [],
    note: 'Facing war over Kuwait, Saddam accepts the Algiers line, pulls back and starts the prisoner exchange.',
  },
];
