import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    // TODO: Replace with actual API call to your backend
    const response = await fetch(`${process.env.API_URL}/anomaly/${params.address}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching anomaly data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomaly data' },
      { status: 500 }
    );
  }
} 