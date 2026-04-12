import { NextResponse } from 'next/server';
import siteCoords from '../../../data/site-coordinates.json';

// In-memory cache: "postcodeSector:mode" → { results, timestamp }
const cache = new Map();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days — travel times are stable

// Extract postcode sector (e.g. "SW1A 1AA" → "SW1A 1") for cache grouping
function postcodeSector(pc) {
  const clean = pc.replace(/\s+/g, '').toUpperCase();
  // UK postcodes: outward (2-4 chars) + inward (3 chars). Sector = outward + first digit of inward.
  if (clean.length < 4) return clean;
  return clean.slice(0, -2);
}

// Deduplicate sites by coordinates (many site names map to same hospital)
function getUniqueSiteDestinations() {
  const seen = new Map(); // "lat,lng" → { name, lat, lng, city }
  for (const [name, data] of Object.entries(siteCoords)) {
    const key = `${data.lat.toFixed(4)},${data.lng.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.set(key, { name, lat: data.lat, lng: data.lng, city: data.city });
    }
  }
  return Array.from(seen.values());
}

// Build a reverse lookup: every site name → the deduplicated destination key
function buildSiteToDestMap() {
  const map = {};
  for (const [name, data] of Object.entries(siteCoords)) {
    map[name] = `${data.lat.toFixed(4)},${data.lng.toFixed(4)}`;
  }
  return map;
}

const siteToDestKey = buildSiteToDestMap();

// Google Distance Matrix allows max 25 destinations per request
async function fetchDistanceMatrix(origin, destinations, mode, apiKey) {
  const destStr = destinations
    .map(d => `${d.lat},${d.lng}`)
    .join('|');

  const params = new URLSearchParams({
    origins: origin,
    destinations: destStr,
    mode,
    units: 'imperial',
    key: apiKey,
  });

  // Transit needs departure_time for accurate results
  if (mode === 'transit') {
    // Next Monday at 9am UTC — gives a representative weekday result
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysUntilMonday = ((8 - dayOfWeek) % 7) || 7;
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(9, 0, 0, 0);
    params.set('departure_time', Math.floor(nextMonday.getTime() / 1000).toString());
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API returned ${res.status}`);
  return res.json();
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}min`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pc = searchParams.get('postcode');

  if (!pc) {
    return NextResponse.json({ error: 'postcode parameter required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 503 });
  }

  const sector = postcodeSector(pc);
  const cacheKey = sector;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ travel: cached.results, cached: true });
  }

  try {
    const uniqueDests = getUniqueSiteDestinations();
    const origin = `postal_code:${pc.replace(/\s+/g, '').toUpperCase()},UK`;

    // Google allows max 25 destinations per request, so batch if needed
    const BATCH_SIZE = 25;
    const drivingResults = {};
    const transitResults = {};

    for (let i = 0; i < uniqueDests.length; i += BATCH_SIZE) {
      const batch = uniqueDests.slice(i, i + BATCH_SIZE);

      // Fetch driving and transit in parallel for this batch
      const [drivingData, transitData] = await Promise.all([
        fetchDistanceMatrix(origin, batch, 'driving', apiKey),
        fetchDistanceMatrix(origin, batch, 'transit', apiKey),
      ]);

      if (drivingData.status !== 'OK' || transitData.status !== 'OK') {
        throw new Error(`API error: driving=${drivingData.status}, transit=${transitData.status}`);
      }

      const drivingElements = drivingData.rows[0]?.elements || [];
      const transitElements = transitData.rows[0]?.elements || [];

      batch.forEach((dest, j) => {
        const coordKey = `${dest.lat.toFixed(4)},${dest.lng.toFixed(4)}`;
        const de = drivingElements[j];
        const te = transitElements[j];

        const result = { city: dest.city };

        if (de?.status === 'OK') {
          result.driving = {
            duration: de.duration.value,
            durationText: formatDuration(de.duration.value),
            distance: de.distance.text,
          };
        }

        if (te?.status === 'OK') {
          result.transit = {
            duration: te.duration.value,
            durationText: formatDuration(te.duration.value),
          };
        }

        drivingResults[coordKey] = result;
      });
    }

    // Build per-site-name results using the coord key mapping
    const results = {};
    for (const [siteName, coordKey] of Object.entries(siteToDestKey)) {
      if (drivingResults[coordKey]) {
        results[siteName] = drivingResults[coordKey];
      }
    }

    // Cache
    cache.set(cacheKey, { results, timestamp: Date.now() });

    return NextResponse.json({ travel: results, cached: false });
  } catch (error) {
    console.error('Travel time API error:', error);
    return NextResponse.json({ error: 'Failed to fetch travel times' }, { status: 500 });
  }
}
