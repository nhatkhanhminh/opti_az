import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Lucky Wheel feature coming soon!',
      stats: {
        totalSpins: 0,
        totalPool: '0',
        totalWinnings: '0',
        todaySpins: 0,
        biggestWin: '0',
        participants: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 