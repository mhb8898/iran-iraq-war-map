// Bibliography. Event cards cite these by id; every card also links its Wikipedia article.
export interface Ref {
  id: string;
  cite: string;
  url?: string;
}

export const REFS: Ref[] = [
  {
    id: 'razoux',
    cite: 'Pierre Razoux, The Iran–Iraq War, trans. Nicholas Elliott (Harvard University Press, 2015).',
  },
  {
    id: 'murray-woods',
    cite: 'Williamson Murray & Kevin M. Woods, The Iran–Iraq War: A Military and Strategic History (Cambridge University Press, 2014).',
    url: 'https://doi.org/10.1017/CBO9781107449794',
  },
  {
    id: 'woods-saddam',
    cite: 'Kevin M. Woods et al., Saddam\'s War: An Iraqi Military Perspective of the Iran–Iraq War (National Defense University, 2009).',
  },
  {
    id: 'cordesman',
    cite: 'Anthony H. Cordesman & Abraham R. Wagner, The Lessons of Modern War, Vol. II: The Iran–Iraq War (Westview, 1990).',
  },
  {
    id: 'pollack',
    cite: 'Kenneth M. Pollack, Arabs at War: Military Effectiveness, 1948–1991 (University of Nebraska Press, 2002), ch. 2.',
  },
  {
    id: 'karsh',
    cite: 'Efraim Karsh, The Iran–Iraq War 1980–1988 (Osprey Essential Histories, 2002).',
  },
  {
    id: 'hiro',
    cite: 'Dilip Hiro, The Longest War: The Iran–Iraq Military Conflict (Routledge, 1991).',
  },
  {
    id: 'algiers-text',
    cite: 'Treaty concerning the State Frontier and Neighbourly Relations between Iran and Iraq, Baghdad, 13 June 1975. UN Treaty Series vol. 1017, No. 14903.',
    url: 'https://treaties.un.org/doc/Publication/UNTS/Volume%201017/volume-1017-I-14903-English.pdf',
  },
  {
    id: 'unsc-598',
    cite: 'UN Security Council Resolution 598 (1987), S/RES/598, 20 July 1987.',
    url: 'https://undocs.org/S/RES/598(1987)',
  },
  {
    id: 'unsc-479',
    cite: 'UN Security Council Resolution 479 (1980), S/RES/479, 28 September 1980.',
    url: 'https://undocs.org/S/RES/479(1980)',
  },
  {
    id: 'hrw-anfal',
    cite: 'Human Rights Watch, Genocide in Iraq: The Anfal Campaign Against the Kurds (1993).',
    url: 'https://www.hrw.org/reports/1993/iraqanfal/',
  },
];

export const refById = Object.fromEntries(REFS.map((r) => [r.id, r]));
