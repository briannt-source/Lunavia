import { Navigation } from "@/components/navigation";

export default function ToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}

