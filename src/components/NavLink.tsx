"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center justify-between px-3 py-2 rounded',
        active ? 'bg-lunavia-primary text-white' : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      {children}
    </Link>
  );
}
