import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComposableMap, Geographies, Geography, type ProjectionFunction } from 'react-simple-maps';
import { geoEqualEarth } from 'd3-geo';
import { useSeenOnce } from '../hooks/useSeenOnce';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/**
 * BOLEN's export map. An Equal Earth world turned to 150°E puts the hub near
 * Shanghai just left of centre, Europe and the Middle East to its left and the
 * Americas across the Pacific to its right, so every corridor is a short arc
 * that never crosses the map's edge. The frame runs from 75°N to 50°S.
 *
 * Labels are HTML laid over the SVG so they keep their size at every width.
 * Below `sm` they would crowd the land, so the map drops them and the caption
 * lists the regions instead.
 *
 * Motion (index.css, "Home lower sections"): when the map is reached the
 * corridors draw out from the hub, nearest market first, each marker and label
 * landing as its corridor arrives; then a light runs out along every corridor
 * in turn while the hub sends out a ring.
 */
const W = 1000;
const H = 405;
const projection = geoEqualEarth().rotate([-150, 0]).scale(184.7).translate([W / 2, 231.6]);
const project = (coordinates: [number, number]) => projection(coordinates) as [number, number];

// Jiaxing, between the Shanghai and Ningbo ports.
const HUB = project([120.75, 30.75]);

type RegionKey =
  | 'northAmerica'
  | 'canada'
  | 'southAmerica'
  | 'europe'
  | 'ukNordics'
  | 'middleEast'
  | 'southeastAsia'
  | 'australia';

/**
 * The eight corridors in home.about.map.regions. `mark` is the certification
 * the certificates section names for that market (CE Europe, UKCA United
 * Kingdom, UL North America, SAA Australia & NZ); `place` keeps neighbouring
 * labels apart.
 */
const REGIONS: { key: RegionKey; at: [number, number]; place: 'above' | 'below'; mark?: string }[] = [
  { key: 'canada', at: [-106, 57], place: 'above' },
  { key: 'northAmerica', at: [-97, 38], place: 'below', mark: 'UL' },
  { key: 'southAmerica', at: [-58, -12], place: 'below' },
  { key: 'ukNordics', at: [4, 59], place: 'above', mark: 'UKCA' },
  { key: 'europe', at: [15, 46], place: 'below', mark: 'CE' },
  { key: 'middleEast', at: [46, 25], place: 'below' },
  { key: 'southeastAsia', at: [103, 12], place: 'below' },
  { key: 'australia', at: [134, -25], place: 'below', mark: 'SAA' },
];

/** A corridor from the hub, bowed away from the equator like a sea lane on a globe. */
function corridor([x, y]: [number, number]): string {
  const [hx, hy] = HUB;
  const dx = x - hx;
  const dy = y - hy;
  const length = Math.hypot(dx, dy);
  let nx = -dy / length;
  let ny = dx / length;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bow = length * 0.2;
  const cx = (hx + x) / 2 + nx * bow;
  const cy = (hy + y) / 2 + ny * bow;
  return `M${hx.toFixed(1)} ${hy.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
}

// Corridors open nearest market first, so the routes visibly reach farther out.
const DRAW_RANK = new Map(
  REGIONS.map((region) => {
    const [x, y] = project(region.at);
    return [region.key, Math.hypot(x - HUB[0], y - HUB[1])] as const;
  })
    .sort((a, b) => a[1] - b[1])
    .map(([key], rank) => [key, rank] as const)
);

const pct = ([x, y]: [number, number]): React.CSSProperties => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
});
const order = (key: RegionKey) => ({ '--i': String(DRAW_RANK.get(key) ?? 0) }) as React.CSSProperties;

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 rounded-[3px] border border-bronze-400/70 bg-[#F5F3EF] px-1 py-px text-[10px] font-semibold leading-none tracking-wide text-amber-800">
      {children}
    </span>
  );
}

export default function GlobalMap() {
  const { t } = useTranslation();
  const [figureRef, seen] = useSeenOnce<HTMLElement>('25%');
  const regionName = (key: RegionKey) => t(`home.about.map.regions.${key}`);
  const summary = `${t('home.about.map.corridors')}: ${REGIONS.map((region) => regionName(region.key)).join(', ')}`;

  return (
    <figure ref={figureRef} data-seen={seen || undefined} className="global-map w-full">
      <div role="img" aria-label={summary} className="relative">
        <ComposableMap
          // v3 uses a function prop as the projection itself; @types describes
          // it as a factory, hence the cast.
          projection={projection as unknown as ProjectionFunction}
          width={W}
          height={H}
          className="block h-auto w-full"
          aria-hidden="true"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E5DDD2"
                  stroke="#F5F3EF"
                  strokeWidth={0.6}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#E5DDD2' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          <g fill="none" stroke="#C4905E" strokeWidth={1.4} strokeLinecap="round">
            {REGIONS.map((region) => (
              <path key={region.key} className="map-corridor" style={order(region.key)} pathLength={1} d={corridor(project(region.at))} />
            ))}
          </g>
          <g fill="none" stroke="#F59E0B" strokeWidth={2.4} strokeLinecap="round">
            {REGIONS.map((region) => (
              <path key={region.key} className="map-flow" style={order(region.key)} pathLength={1} d={corridor(project(region.at))} />
            ))}
          </g>
          {REGIONS.map((region) => {
            const [x, y] = project(region.at);
            return (
              <circle
                key={region.key}
                className="map-marker"
                style={order(region.key)}
                cx={x}
                cy={y}
                r={5}
                fill="#C4905E"
                stroke="#F5F3EF"
                strokeWidth={2}
              />
            );
          })}
          <circle cx={HUB[0]} cy={HUB[1]} r={13} fill="none" stroke="#C4905E" strokeOpacity={0.5} strokeWidth={1.2} />
          <circle className="map-hub-ping" cx={HUB[0]} cy={HUB[1]} r={13} fill="none" stroke="#F59E0B" strokeWidth={1.5} />
          <circle cx={HUB[0]} cy={HUB[1]} r={6.5} fill="#B45309" stroke="#F5F3EF" strokeWidth={2} />
        </ComposableMap>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden text-stone-700 sm:block">
          {REGIONS.map((region) => (
            <span
              key={region.key}
              style={{ ...pct(project(region.at)), ...order(region.key) }}
              className={`map-label absolute flex -translate-x-1/2 items-center whitespace-nowrap text-[12.5px] font-medium [text-shadow:0_0_3px_#F5F3EF,0_0_3px_#F5F3EF] ${
                region.place === 'above' ? '-translate-y-[calc(100%+9px)]' : 'translate-y-[9px]'
              }`}
            >
              {regionName(region.key)}
              {region.mark && <Mark>{region.mark}</Mark>}
            </span>
          ))}
          {/* Below and right of the hub: the corridors leave it upwards to the
              right (the Americas), to the left (Europe) and straight down
              (Australia), and this is the one wedge none of them cross. */}
          <span
            style={pct(HUB)}
            className="map-label absolute translate-x-[12px] translate-y-[10px] whitespace-nowrap [text-shadow:0_0_3px_#F5F3EF,0_0_3px_#F5F3EF]"
          >
            <span className="block text-[13px] font-semibold text-stone-900">{t('home.about.map.hub')}</span>
            <span className="block text-[11.5px] text-stone-500">{t('home.about.map.hubSub')}</span>
          </span>
        </div>
      </div>

      <figcaption className="mt-3 text-[13px] text-stone-600">
        <span className="inline-flex items-center gap-2 font-medium text-stone-800">
          <span aria-hidden="true" className="h-[1.5px] w-6 rounded-full bg-bronze-400" />
          {t('home.about.map.corridors')}
        </span>
        <span className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2 sm:hidden">
          {REGIONS.map((region) => (
            <span key={region.key} className="inline-flex items-center">
              {regionName(region.key)}
              {region.mark && <Mark>{region.mark}</Mark>}
            </span>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
