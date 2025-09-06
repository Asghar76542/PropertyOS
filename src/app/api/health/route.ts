import { NextResponse } from "next/server";

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'ok', // You can add actual database health check here
        redis: 'ok',     // You can add actual Redis health check here
        websockets: 'ok',
      },
      features: {
        mobile_app: process.env.ENABLE_MOBILE_APP === 'true',
        websockets: process.env.ENABLE_WEBSOCKETS === 'true',
        file_uploads: process.env.ENABLE_FILE_UPLOADS === 'true',
      },
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}