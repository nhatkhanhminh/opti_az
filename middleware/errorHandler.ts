// middleware/errorHandler.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    // Tiếp tục xử lý request
    return NextResponse.next();
  } catch (error) {
    console.error('Unhandled error in middleware:', error);
    
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = 'Unserializable error object';
      }
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
