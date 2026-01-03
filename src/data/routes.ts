/**
 * Curated routes data for MX5 Pocket.
 * Ireland-first collection of scenic driving roads.
 */

import type { CuratedRoute } from '../models/types';

export const curatedRoutes: CuratedRoute[] = [
  {
    id: 'healy-pass',
    name: 'Healy Pass',
    region: 'Cork/Kerry Border',
    country: 'Ireland',
    description:
      'A stunning mountain pass crossing the Caha Mountains between Cork and Kerry. The narrow road climbs through dramatic scenery with tight hairpins and rewarding views.',
    whySpecial:
      'One of the best driving roads in Ireland. Perfect for an MX-5 with tight hairpins that reward smooth inputs and the views at the top are unforgettable.',
    difficulty: 'challenging',
    bestTimeOfDay: 'morning',
    surfaceCondition: 'good',
    lengthKm: 14,
    durationMinutes: 25,
    surfaceNotes: 'Watch for loose gravel on hairpins, especially after rain. Single track in places.',
    startLat: 51.7553,
    startLon: -9.8069,
  },
  {
    id: 'gap-of-dunloe',
    name: 'Gap of Dunloe',
    region: 'County Kerry',
    country: 'Ireland',
    description:
      'A narrow mountain pass near Killarney that winds between the MacGillycuddy Reeks and Purple Mountain. Ancient stone bridges and lakes dot the route.',
    whySpecial:
      'The narrow road forces you to slow down and focus on precision. Early morning drives avoid tourist traffic and let you flow through the ancient landscape.',
    difficulty: 'moderate',
    bestTimeOfDay: 'morning',
    surfaceCondition: 'variable',
    lengthKm: 11,
    durationMinutes: 30,
    surfaceNotes: 'Very narrow with passing places. Avoid peak tourist hours (10am-4pm in summer).',
    startLat: 52.0197,
    startLon: -9.6531,
  },
  {
    id: 'conor-pass',
    name: 'Conor Pass',
    region: 'Dingle Peninsula',
    country: 'Ireland',
    description:
      'The highest mountain pass in Ireland, offering spectacular views of Brandon Bay and the Dingle Peninsula. Technical climbs with stunning coastal vistas.',
    whySpecial:
      'The combination of elevation changes and ocean views is magical. The road demands respect with blind crests and tight corners.',
    difficulty: 'challenging',
    bestTimeOfDay: 'evening',
    surfaceCondition: 'good',
    lengthKm: 9,
    durationMinutes: 20,
    surfaceNotes: 'Steep gradients. Can be foggy at summit. Use lower gears for descent.',
    startLat: 52.1892,
    startLon: -10.1508,
  },
  {
    id: 'sally-gap',
    name: 'Sally Gap',
    region: 'Wicklow Mountains',
    country: 'Ireland',
    description:
      'A high mountain road crossing the Wicklow Mountains south of Dublin. Rolling moorland with flowing curves and minimal traffic.',
    whySpecial:
      'Accessible from Dublin yet feels remote. Long flowing sections perfect for finding your rhythm with the car.',
    difficulty: 'easy',
    bestTimeOfDay: 'any',
    surfaceCondition: 'excellent',
    lengthKm: 22,
    durationMinutes: 30,
    surfaceNotes: 'Well-maintained surface. Can be windy at higher elevations.',
    startLat: 53.1375,
    startLon: -6.3214,
  },
  {
    id: 'ring-of-beara',
    name: 'Ring of Beara',
    region: 'West Cork',
    country: 'Ireland',
    description:
      'A 140km loop around the Beara Peninsula, less touristy than the Ring of Kerry but equally dramatic. Coastal roads with mountain sections.',
    whySpecial:
      'The quieter alternative to Ring of Kerry. Mix of fast coastal sweeps and technical mountain sections. Best experienced over a full day.',
    difficulty: 'moderate',
    bestTimeOfDay: 'any',
    surfaceCondition: 'good',
    lengthKm: 140,
    durationMinutes: 180,
    surfaceNotes: 'Full loop is long. Can be broken into sections. Fuel up before starting.',
    startLat: 51.6506,
    startLon: -9.9031,
  },
  {
    id: 'ballaghbeama-gap',
    name: 'Ballaghbeama Gap',
    region: 'County Kerry',
    country: 'Ireland',
    description:
      'A hidden gem mountain pass connecting the Iveragh Peninsula to the Beara Peninsula. Raw and untouched with challenging terrain.',
    whySpecial:
      'One of the most demanding roads in Ireland. Rewards precise inputs and commitment. Not for the faint-hearted.',
    difficulty: 'challenging',
    bestTimeOfDay: 'midday',
    surfaceCondition: 'variable',
    lengthKm: 8,
    durationMinutes: 20,
    surfaceNotes: 'Very rough in places. Take it slow until you know the road.',
    startLat: 51.9058,
    startLon: -9.7547,
  },
  {
    id: 'coast-road-antrim',
    name: 'Antrim Coast Road',
    region: 'County Antrim',
    country: 'Northern Ireland',
    description:
      'A scenic coastal route between Larne and Ballycastle. Dramatic cliffs, picturesque villages, and the famous Glens of Antrim.',
    whySpecial:
      'One of the most beautiful coastal drives in Europe. Mix of flowing coastal sweeps with occasional tight sections through villages.',
    difficulty: 'easy',
    bestTimeOfDay: 'evening',
    surfaceCondition: 'excellent',
    lengthKm: 60,
    durationMinutes: 90,
    surfaceNotes: 'Well-maintained. Watch for slow-moving tourist traffic in summer.',
    startLat: 54.8508,
    startLon: -5.8208,
  },
  {
    id: 'glengesh-pass',
    name: 'Glengesh Pass',
    region: 'County Donegal',
    country: 'Ireland',
    description:
      'A dramatic mountain pass in northwest Donegal with steep gradients and spectacular views of the Atlantic.',
    whySpecial:
      'Remote and rarely busy. The descent towards the coast is exhilarating. Perfect for a morning blast.',
    difficulty: 'moderate',
    bestTimeOfDay: 'morning',
    surfaceCondition: 'good',
    lengthKm: 12,
    durationMinutes: 20,
    surfaceNotes: 'Steep hairpins on descent. Take care in wet conditions.',
    startLat: 54.7783,
    startLon: -8.6247,
  },
  {
    id: 'slieve-league',
    name: 'Slieve League Drive',
    region: 'County Donegal',
    country: 'Ireland',
    description:
      'The road to the Slieve League cliffs, some of the highest sea cliffs in Europe. Narrow and winding with breathtaking ocean views.',
    whySpecial:
      'The destination is spectacular, and the journey is equally rewarding. Quiet roads with technical sections near the summit.',
    difficulty: 'moderate',
    bestTimeOfDay: 'evening',
    surfaceCondition: 'good',
    lengthKm: 15,
    durationMinutes: 30,
    surfaceNotes: 'Very narrow near the top. Passing places available but be prepared to reverse.',
    startLat: 54.6392,
    startLon: -8.6819,
  },
  {
    id: 'burren-coast',
    name: 'The Burren Coast Road',
    region: 'County Clare',
    country: 'Ireland',
    description:
      'A unique drive through the lunar landscape of the Burren, combining coastal views with otherworldly limestone terrain.',
    whySpecial:
      'Unlike anywhere else in Ireland. The stark beauty and flowing road create a meditative driving experience.',
    difficulty: 'easy',
    bestTimeOfDay: 'any',
    surfaceCondition: 'excellent',
    lengthKm: 35,
    durationMinutes: 50,
    surfaceNotes: 'Good surface throughout. Can be exposed to Atlantic weather.',
    startLat: 53.1158,
    startLon: -9.2689,
  },
  {
    id: 'moll-gap',
    name: "Moll's Gap",
    region: 'County Kerry',
    country: 'Ireland',
    description:
      'A high mountain pass on the N71 between Kenmare and Killarney. Sweeping curves with views of the Black Valley.',
    whySpecial:
      'Combines with the Ring of Kerry for an epic driving day. The views at the top are worth the climb.',
    difficulty: 'moderate',
    bestTimeOfDay: 'morning',
    surfaceCondition: 'excellent',
    lengthKm: 18,
    durationMinutes: 25,
    surfaceNotes: 'Main road so well-maintained. Watch for tour buses in summer.',
    startLat: 51.9306,
    startLon: -9.6244,
  },
  {
    id: 'coumshingaun',
    name: 'Coumshingaun Loop',
    region: 'Comeragh Mountains',
    country: 'Ireland',
    description:
      'A hidden gem in the Comeragh Mountains of Waterford. Quiet mountain roads with a glacial lake as the centerpiece.',
    whySpecial:
      'Off the beaten track and rarely mentioned. Perfect for a solo morning drive with minimal traffic.',
    difficulty: 'moderate',
    bestTimeOfDay: 'morning',
    surfaceCondition: 'variable',
    lengthKm: 25,
    durationMinutes: 40,
    surfaceNotes: 'Some sections are rougher. Local knowledge helps.',
    startLat: 52.2569,
    startLon: -7.5222,
  },
];

/**
 * Get all curated routes.
 */
export function getAllRoutes(): CuratedRoute[] {
  return curatedRoutes;
}

/**
 * Get a route by ID.
 */
export function getRouteById(id: string): CuratedRoute | undefined {
  return curatedRoutes.find((route) => route.id === id);
}

/**
 * Get routes by difficulty.
 */
export function getRoutesByDifficulty(
  difficulty: CuratedRoute['difficulty']
): CuratedRoute[] {
  return curatedRoutes.filter((route) => route.difficulty === difficulty);
}

/**
 * Get routes by region.
 */
export function getRoutesByRegion(region: string): CuratedRoute[] {
  return curatedRoutes.filter((route) =>
    route.region.toLowerCase().includes(region.toLowerCase())
  );
}
