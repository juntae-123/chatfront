import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function POST(req: NextRequest) {
  try {
    
    const body = await req.json();

  
    const res = await fetch(`${BACKEND_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      
      return NextResponse.json(
        { error: data?.message || '회원가입 실패' },
        { status: res.status }
      );
    }

    
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error('Signup API Error:', err);
    return NextResponse.json(
      { error: err.message || '서버 오류' },
      { status: 500 }
    );
  }
}
