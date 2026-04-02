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
      { headers: { 'Content-Type': 'application/json' }, next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching clinical trials:', error);
    try {
      const trials = (await import('../../../data/clinical-trials.json')).default;
      let filtered = trials;
      if (category) filtered = filtered.filter(t => t.category === category);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.sites.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ total: filtered.length, trials: filtered });
    } catch { return NextResponse.json({ total: 0, trials: [] }, { status: 500 }); }
  }
}

// Submit trial via access key
export async function POST(request) {
  try {
    const accessKey = request.headers.get('x-trial-access-key');
    const apiKey = request.headers.get('x-api-key');

    if (!accessKey && !apiKey) {
      return NextResponse.json({ error: 'Access key or API key required' }, { status: 401 });
    }

    const body = await request.json();
    const headers = { 'Content-Type': 'application/json' };

    let url = `${API_BASE_URL}/api/v1/clinical-trials/`;
    if (accessKey) {
      url = `${API_BASE_URL}/api/v1/clinical-trials/submit`;
      headers['X-Trial-Access-Key'] = accessKey;
    } else {
      headers['X-API-Key'] = apiKey;
    }

    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error creating trial:', error);
    return NextResponse.json({ error: 'Failed to create trial' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

    const trialId = new URL(request.url).searchParams.get('id');
    if (!trialId) return NextResponse.json({ error: 'Trial id required' }, { status: 400 });

    const body = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/v1/clinical-trials/${trialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error updating trial:', error);
    return NextResponse.json({ error: 'Failed to update trial' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

    const trialId = new URL(request.url).searchParams.get('id');
    if (!trialId) return NextResponse.json({ error: 'Trial id required' }, { status: 400 });

    const res = await fetch(`${API_BASE_URL}/api/v1/clinical-trials/${trialId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error deleting trial:', error);
    return NextResponse.json({ error: 'Failed to delete trial' }, { status: 500 });
  }
}
