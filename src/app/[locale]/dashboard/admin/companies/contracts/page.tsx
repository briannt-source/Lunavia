"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { FileText, CheckCircle2, XCircle, Clock, Building2, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ContractVerificationPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all companies with members
  const { data: companies, isLoading } = useQuery({
    queryKey: ["adminCompanies"],
    queryFn: async () => {
      // We'll need to create an API endpoint for this
      // For now, return empty array
      return [];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      companyId,
      guideId,
      verified,
    }: {
      companyId: string;
      guideId: string;
      verified: boolean;
    }) => {
      const res = await fetch(
        `/api/admin/companies/${companyId}/members/${guideId}/verify-contract`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verified }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái xác minh hợp đồng!");
      queryClient.invalidateQueries({ queryKey: ["adminCompanies"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật trạng thái");
    },
  });

  // For now, show a placeholder
  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Xác minh Hợp đồng Lao động"
          description="Xác minh hợp đồng lao động cho in-house guides"
        />

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-muted-foreground">
                Tính năng này đang được phát triển. Admin có thể verify contracts từ trang quản lý companies.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

