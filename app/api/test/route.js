import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Test API route hit');
  return NextResponse.json({ message: 'Test endpoint working' });
} 