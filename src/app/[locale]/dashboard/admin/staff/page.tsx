import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Internal Staff Management — Lunavia',
};

/**
 * Staff page redirects to Admin Management (/dashboard/admin/admins)
 * which provides full CRUD for internal admin accounts.
 * The old staff page queried the User model with non-existent fields.
 */
export default function InternalStaffPage() {
    redirect('/dashboard/admin/admins');
}
