import { redirect } from 'next/navigation';

export default function OperatorSettingsRedirect() {
    redirect('/dashboard/operator/profile');
}
