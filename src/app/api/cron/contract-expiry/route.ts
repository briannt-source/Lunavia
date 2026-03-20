import { NextResponse } from 'next/server';
import { runContractExpiryCheck } from '@/lib/jobs/contract-expiry';

/**
 * POST /api/cron/contract-expiry
 * Trigger contract expiry check.
 * Protected by CRON_SECRET for production.
 */
export async function POST(req: Request) {
  // Verify CRON secret in production
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runContractExpiryCheck();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Contract expiry check failed:', error);
    return NextResponse.json(
      { error: 'Contract expiry check failed' },
      { status: 500 }
    );
  }
}
