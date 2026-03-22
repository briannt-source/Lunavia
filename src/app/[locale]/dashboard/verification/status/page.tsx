import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verification Status — Lunavia' };

export default async function VerificationStatus() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user) return <div>Unauthorized</div>;

  // Fetch fresh status
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { verifiedStatus: true }
  });

  const status = dbUser?.verifiedStatus || 'NOT_SUBMITTED';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {status === 'APPROVED' ? 'Verification Complete!' :
            status === 'REJECTED' ? 'Verification Failed' :
              status === 'SUBMITTED' ? 'Application Received' : 'Verification Status'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6 text-center">

          {status === 'APPROVED' && (
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-green-800 font-medium">You are officially verified!</p>
              <p className="text-sm text-green-700 mt-2">
                Your account now has the verified badge, increasing your visibility and trust score.
              </p>
            </div>
          )}

          {(status === 'PENDING' || status === 'SUBMITTED') && (
            <div className="bg-lunavia-light p-4 rounded-md">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-blue-800 font-medium">Under Review</p>
              <p className="text-sm text-lunavia-primary-hover mt-2">
                Thank you for submitting your documents. Our compliance team is reviewing your application.
              </p>
              <p className="text-xs text-lunavia-primary mt-4">Estimated review time: 24-48 hours</p>
            </div>
          )}

          {status === 'REJECTED' && (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-red-800 font-medium">Action Required</p>
              <p className="text-sm text-red-700 mt-2">
                Unfortunately, we could not verify your documents. Please check your email for details or try again.
              </p>
              <Link href={`/dashboard/${user.role === 'TOUR_OPERATOR' ? 'operator' : 'guide'}/verification`} className="mt-4 inline-block text-sm font-bold text-red-600 underline">
                Resubmit Documents
              </Link>
            </div>
          )}

          {status === 'NOT_SUBMITTED' && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-600">You have not submitted verification yet.</p>
              <Link href={`/dashboard/${user.role === 'TOUR_OPERATOR' ? 'operator' : 'guide'}/verification`} className="block mt-4 w-full bg-lunavia-primary text-white py-2 rounded-md hover:bg-indigo-700">
                Start Verification
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <Link href="/dashboard" className="text-[#5BA4CF] font-medium hover:text-[#5BA4CF]">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
