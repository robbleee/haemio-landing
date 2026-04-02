import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.HAEM_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/clinical-trials/?${params.toString()}`,
      {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 300 }, // cache for 5 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching clinical trials from API:', error);

    // Fallback: serve from local JSON file if API is unreachable
    try {
      const trials = (await import('../../../data/clinical-trials.json')).default;

      let filtered = trials;
      if (category) {
        filtered = filtered.filter(t => t.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.sites.toLowerCase().includes(q)
        );
      }

      return NextResponse.json({ total: filtered.length, trials: filtered });
    } catch {
      return NextResponse.json({ total: 0, trials: [] }, { status: 500 });
    }
  }
}
