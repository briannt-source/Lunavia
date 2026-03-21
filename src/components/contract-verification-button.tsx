"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ContractVerificationButtonProps {
  companyId: string;
  guideId: string;
  currentVerified: boolean;
  hasContract: boolean;
}

export function ContractVerificationButton({
  companyId,
  guideId,
  currentVerified,
  hasContract,
}: ContractVerificationButtonProps) {
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async (verified: boolean) => {
      const res = await fetch(
        `/api/admin/companies/${companyId}/members/${guideId}/verify-contract`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verified }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to verify contract");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        currentVerified
          ? "Contract verification cancelled"
          : "Contract verified successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["adminCompanies"] });
      queryClient.invalidateQueries({ queryKey: ["companyGuides"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to update status");
    },
  });

  if (!hasContract) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant={currentVerified ? "outline" : "default"}
      onClick={() => verifyMutation.mutate(!currentVerified)}
      disabled={verifyMutation.isPending}
    >
      {currentVerified ? (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Hủy xác minh
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Xác minh
        </>
      )}
    </Button>
  );
}

