"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Compass, Moon, LayoutDashboard, MapPin, Plus, Briefcase, Shield, Users, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) {
    return null;
  }

  const role = (session.user as any)?.role;
  const userEmail = session.user?.email;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  // Menu items based on role
  const getMenuItems = () => {
    if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
      return [
        { href: "/dashboard/operator", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/operator/tours", label: "Tours", icon: MapPin },
        { href: "/dashboard/operator/tours/new", label: "Create Tour", icon: Plus },
        { href: "/dashboard/operator/profile", label: "Profile", icon: Users },
      ];
    } else if (role === "TOUR_GUIDE") {
      return [
        { href: "/dashboard/guide", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/guide/tours", label: "Tours", icon: MapPin },
        { href: "/dashboard/guide/applications", label: "Applications", icon: Briefcase },
        { href: "/dashboard/guide/profile", label: "Profile", icon: Users },
      ];
    } else if (role && role.startsWith("ADMIN_")) {
      // Admin users
      const adminRole = role.replace("ADMIN_", "");
      const menuItems = [
        { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/admin", label: "Profile", icon: Users },
      ];

      // Add menu items based on permissions
      if (adminRole === "SUPER_ADMIN" || adminRole === "MODERATOR") {
        menuItems.splice(1, 0,
          { href: "/dashboard/admin/disputes", label: "Disputes", icon: Shield },
          { href: "/dashboard/admin/verifications", label: "Verifications", icon: Shield }
        );
      }
      if (adminRole === "SUPER_ADMIN") {
        menuItems.splice(-1, 0, { href: "/dashboard/admin/users", label: "Users", icon: Users });
      }
      return menuItems;
    } else {
      // Fallback
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/profile", label: "Profile", icon: Users },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <Moon className="h-8 w-8 text-[#5BA4CF]" />
              <Compass className="h-5 w-5 text-emerald-500 absolute -bottom-1 -right-1" />
            </div>
            <span className="text-xl font-bold text-indigo-900 hidden sm:inline">LUNAVIA</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* User Email (Desktop) */}
            <span className="hidden md:block text-sm text-muted-foreground">
              {userEmail}
            </span>

            {/* Logout Button (Desktop) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Icon className="h-5 w-5" />
                  <span className={isActive(item.href) ? "font-semibold" : ""}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
            <div className="border-t pt-2 mt-2">
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {userEmail}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-left"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

