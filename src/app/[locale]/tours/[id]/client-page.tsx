"use client";

import { useState } from "react";
import { AIMatchingDialog } from "@/components/ai-matching-dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ClientPageProps {
  tourId: string;
  tourVisibility: "PUBLIC" | "PRIVATE";
  isOperator: boolean;
}

export function TourDetailClient({ tourId, tourVisibility, isOperator }: ClientPageProps) {
  const [aiMatchingOpen, setAIMatchingOpen] = useState(false);
  const router = useRouter();

  const handleInvite = async (guideId: string) => {
    // For public tours, we can't directly invite - guides need to apply
    // This is just a placeholder - in real implementation, you might want to
    // send a notification or message to the guide
    toast.success("Guide will receive a notification about this tour");
    setAIMatchingOpen(false);
    router.refresh();
  };

  const handleAssign = async (guideId: string, role: "MAIN" | "SUB") => {
    try {
      await api.tours.assign(tourId, { guideId, role });
      toast.success("Guide assigned successfully!");
      setAIMatchingOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error during assignment");
    }
  };

  if (!isOperator) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setAIMatchingOpen(true)}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI Guide Matching
      </Button>

      <AIMatchingDialog
        open={aiMatchingOpen}
        onOpenChange={setAIMatchingOpen}
        tourId={tourId}
        tourVisibility={tourVisibility}
        onInvite={handleInvite}
        onAssign={handleAssign}
      />
    </>
  );
}

