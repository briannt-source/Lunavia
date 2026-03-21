"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface MessageButtonProps {
  tourId: string;
  guideId?: string;
  operatorId?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function MessageButton({
  tourId,
  guideId,
  operatorId,
  className,
  variant = "outline",
  size = "default",
}: MessageButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!session?.user?.id) {
      toast.error("Please log in");
      return;
    }

    setLoading(true);
    try {
      const userId = session.user.id;
      const userRole = session.user.role;
      
      // Determine guideId based on user role
      let finalGuideId: string;
      
      if (userRole === "TOUR_GUIDE") {
        // If user is a guide, guideId should be the current user (the guide themselves)
        finalGuideId = userId;
      } else if (userRole === "TOUR_OPERATOR" || userRole === "TOUR_AGENCY") {
        // If user is an operator, guideId should be the guide they want to message
        if (!guideId) {
          toast.error("Unable to identify guide for messaging");
          return;
        }
        finalGuideId = guideId;
      } else {
        toast.error("Only tour guides and tour operators can send messages");
        return;
      }

      // Get or create conversation
      const conversation = await api.messages.getOrCreateConversation(
        tourId,
        finalGuideId
      );

      // Navigate to chat
      router.push(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error(error.message || "Unable to create conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      {loading ? "Loading..." : "Message"}
    </Button>
  );
}

