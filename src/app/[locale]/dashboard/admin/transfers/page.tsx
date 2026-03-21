"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatVND } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Wallet } from "lucide-react";
import { Link } from '@/navigation';
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminTransfersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Fetch users for selection
  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users", "for-transfer"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users/for-transfer");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: {
      fromUserId: string;
      toUserId: string;
      amount: number;
      reason: string;
    }) => {
      const response = await fetch("/api/admin/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create transfer");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Transfer completed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setFromUserId("");
      setToUserId("");
      setAmount("");
      setReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        toast.error("Invalid amount");
        setProcessing(false);
        return;
      }

      if (!reason.trim()) {
        toast.error("Please enter a transfer reason");
        setProcessing(false);
        return;
      }

      await transferMutation.mutateAsync({
        fromUserId,
        toUserId,
        amount: amountNum,
        reason,
      });
    } finally {
      setProcessing(false);
    }
  };

  const fromUser = users.find((u: any) => u.id === fromUserId);
  const toUser = users.find((u: any) => u.id === toUserId);

  return (
    <>
      <PageHeader
        title="Internal Transfer"
        description="Internal transfers between accounts (SUPER_ADMIN only)"
        action={
          <Link href="/dashboard/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Chuyển tiền nội bộ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fromUser">Từ tài khoản *</Label>
                  <Select value={fromUserId} onValueChange={setFromUserId} required>
                    <SelectTrigger id="fromUser">
                      <SelectValue placeholder="Select sender account" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u: any) => u.role === "TOUR_OPERATOR" || u.role === "TOUR_AGENCY")
                        .map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.profile?.name || user.email} ({user.role.replace(/_/g, " ")})
                            {user.wallet && ` - ${formatVND(user.wallet.balance)}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {fromUser && fromUser.wallet && (
                    <p className="text-sm text-slate-500 mt-1">
                      Số dư khả dụng: {formatVND(fromUser.wallet.balance)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="toUser">Đến tài khoản *</Label>
                  <Select value={toUserId} onValueChange={setToUserId} required>
                    <SelectTrigger id="toUser">
                      <SelectValue placeholder="Select receiver account" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u: any) => u.role === "TOUR_GUIDE")
                        .map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.profile?.name || user.email} ({user.role.replace(/_/g, " ")})
                            {user.wallet && ` - ${formatVND(user.wallet.balance)}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (VND) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason chuyển tiền *</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter transfer reason..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                  {processing ? "Processing..." : "Transfer Funds"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Xem trước</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fromUser && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Từ</p>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium">{fromUser.profile?.name || fromUser.email}</p>
                      <p className="text-xs text-slate-500">
                        {fromUser.role.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {fromUser && toUser && (
                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
              )}

              {toUser && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Đến</p>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium">{toUser.profile?.name || toUser.email}</p>
                      <p className="text-xs text-slate-500">
                        {toUser.role.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {amount && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {formatVND(parseFloat(amount) || 0)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}












