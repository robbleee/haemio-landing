import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.HAEM_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request) {
  const accessKey = request.headers.get('x-trial-access-key');
  if (!accessKey) {
    return NextResponse.json({ valid: false, error: 'No key provided' }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/clinical-trials/verify-key`, {
      headers: { 'X-Trial-Access-Key': accessKey },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
