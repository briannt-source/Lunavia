import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon, CheckCircle2 } from "lucide-react";

/**
 * Role Card Component
 * Reusable card for role selection (Tour Operator / Tour Guide)
 * 
 * Location: src/components/stitch/welcome/role-card.tsx
 */
interface RoleCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  badgeText: string;
  badgeColor: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  checkIconColor?: string;
}

export function RoleCard({
  icon: Icon,
  iconBgColor,
  iconTextColor,
  badgeText,
  badgeColor,
  title,
  description,
  features,
  buttonText,
  buttonHref,
  checkIconColor = "text-primary",
}: RoleCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-background-dark p-8 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
      <div className="mb-6 flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl ${iconBgColor} ${iconTextColor}`}
        >
          <Icon className="h-8 w-8" />
        </div>
        <span className={`rounded-full ${badgeColor} px-3 py-1 text-xs font-semibold`}>
          {badgeText}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-4 flex-auto text-base text-gray-600 dark:text-gray-400">{description}</p>
      <ul className="mt-8 space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <CheckCircle2 className={`h-5 w-5 ${checkIconColor}`} />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        className="mt-auto w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        asChild
      >
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </div>
  );
}



