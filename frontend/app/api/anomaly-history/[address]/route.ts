import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const response = await fetch(`http://localhost:8000/anomaly-history/${params.address}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching anomaly history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomaly history' },
      { status: 500 }
    );
  }
} 