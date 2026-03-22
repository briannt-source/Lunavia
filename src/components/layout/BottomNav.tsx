'use client';

import Link from 'next/link';
import { usePathname } from '@/navigation';
import { Home, MapPin, Wallet, User, Search, BarChart3, ShieldCheck, Users, Calendar, Briefcase } from 'lucide-react';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

function BottomNavBar({ items }: { items: NavItem[] }) {
    const pathname = usePathname();

    return (
        <div className="flex items-center justify-around h-14 px-1">
            {items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1.5 rounded-lg transition-colors ${
                            isActive
                                ? 'text-indigo-600'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <span className={isActive ? 'scale-110 transition-transform' : 'transition-transform'}>
                            {item.icon}
                        </span>
                        <span className={`text-[10px] font-semibold truncate ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}

// ── Role-specific bottom navs ──────────────────────────────

export function OperatorBottomNav() {
    return (
        <BottomNavBar
            items={[
                { icon: <Home className="h-5 w-5" />, label: 'Home', href: '/dashboard/operator' },
                { icon: <MapPin className="h-5 w-5" />, label: 'Tours', href: '/dashboard/operator/tours' },
                { icon: <Users className="h-5 w-5" />, label: 'Applications', href: '/dashboard/operator/applications' },
                { icon: <Wallet className="h-5 w-5" />, label: 'Wallet', href: '/dashboard/operator/wallet' },
                { icon: <BarChart3 className="h-5 w-5" />, label: 'Insights', href: '/dashboard/operator/insights' },
            ]}
        />
    );
}

export function GuideBottomNav() {
    return (
        <BottomNavBar
            items={[
                { icon: <Home className="h-5 w-5" />, label: 'Home', href: '/dashboard/guide' },
                { icon: <Search className="h-5 w-5" />, label: 'Find Tours', href: '/dashboard/guide/available' },
                { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', href: '/dashboard/guide/calendar' },
                { icon: <Briefcase className="h-5 w-5" />, label: 'Earnings', href: '/dashboard/guide/earnings' },
                { icon: <User className="h-5 w-5" />, label: 'Profile', href: '/dashboard/guide/profile' },
            ]}
        />
    );
}

export function AdminBottomNav() {
    return (
        <BottomNavBar
            items={[
                { icon: <Home className="h-5 w-5" />, label: 'Home', href: '/dashboard/admin' },
                { icon: <ShieldCheck className="h-5 w-5" />, label: 'Verify', href: '/dashboard/admin/verification' },
                { icon: <MapPin className="h-5 w-5" />, label: 'Tours', href: '/dashboard/admin/tours' },
                { icon: <Users className="h-5 w-5" />, label: 'Users', href: '/dashboard/admin/users' },
                { icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics', href: '/dashboard/admin/analytics' },
            ]}
        />
    );
}
