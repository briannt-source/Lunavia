import { LucideIcon } from "lucide-react";

/**
 * Feature Card Component
 * Reusable feature card for showcasing platform features
 * 
 * Location: src/components/stitch/welcome/feature-card.tsx
 */
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 mb-6">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}



