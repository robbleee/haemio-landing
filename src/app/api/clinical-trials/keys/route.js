import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.HAEM_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/clinical-trials/keys`, {
      headers: { 'X-API-Key': apiKey },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to list keys' }, { status: 500 });
  }
}

export async function POST(request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/v1/clinical-trials/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

  const key = new URL(request.url).searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Key param required' }, { status: 400 });

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/clinical-trials/keys/${key}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': apiKey },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 });
  }
}
