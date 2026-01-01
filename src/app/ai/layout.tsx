import { Navigation } from "@/components/navigation";

export default function AILayout({
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

