import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runGovernanceIntegrityChecks } from '@/domain/governance/GovernanceIntegrity';

/**
 * GET /api/health
 * Health check endpoint for monitoring and deployment verification.
 * Returns database connectivity status, governance integrity, and basic system info.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    // Run governance integrity checks
    const governanceChecks = runGovernanceIntegrityChecks();
    const governanceFailed = governanceChecks.filter((c) => c.status === 'FAIL');

    return NextResponse.json({
      status: governanceFailed.length > 0 ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: { status: 'connected', latencyMs: dbLatency },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
        governance: {
          status: governanceFailed.length > 0 ? 'FAIL' : 'PASS',
          total: governanceChecks.length,
          passed: governanceChecks.filter((c) => c.status === 'PASS').length,
          failed: governanceFailed.length,
          warnings: governanceChecks.filter((c) => c.status === 'WARN').length,
          details: governanceChecks,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: 'disconnected', error: 'Connection failed' },
        },
      },
      { status: 503 }
    );
  }
}
