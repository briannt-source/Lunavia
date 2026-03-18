import VerificationLayout from '../layout';
import DocumentUpload from '@/components/DocumentUpload';

export const metadata = { title: 'Sole Operator Verification — Lunavia' };

export default function SoleVerification() {
  return (
    <VerificationLayout>
      <h2 className="text-lg font-semibold">Sole Operator KYC</h2>
      <div className="mt-4 space-y-4">
        <DocumentUpload label="Government ID" />
        <DocumentUpload label="Proof of Address (MANDATORY)" />
      </div>
      <button className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white" disabled>
        Submit (disabled — logic later)
      </button>
    </VerificationLayout>
  );
}
