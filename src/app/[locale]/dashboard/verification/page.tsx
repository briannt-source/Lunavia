import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Verification — Lunavia' };

export default async function VerificationHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;

  if (role === 'TOUR_OPERATOR') {
    redirect('/dashboard/operator/verification');
  } else if (role === 'TOUR_GUIDE') {
    redirect('/dashboard/guide/verification');
  } else {
    redirect('/');
  }
}
