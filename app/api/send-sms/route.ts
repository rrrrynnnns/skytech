import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Get API credentials from environment variables
    const apiKey = process.env.SEMAPHORE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'SMS service not configured. Please add SEMAPHORE_API_KEY to your .env.local file',
          instructions: 'Get your API key from semaphore.co and add it to .env.local'
        },
        { status: 500 }
      );
    }

    // Using Semaphore SMS API (popular in Philippines)
    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: apiKey,
        number: phone,
        message: message,
        sendername: 'SEMAPHORE', // You can customize this
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to send SMS' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      data: data,
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
