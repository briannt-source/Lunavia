"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, Plus, Edit, Trash2, QrCode } from "lucide-react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";

export default function PaymentSettingsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchName: "",
    qrCodeUrl: "",
    notes: "",
    isActive: true,
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["lunaviaBankAccounts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/payment-settings/bank-accounts");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/payment-settings/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Bank account created");
      queryClient.invalidateQueries({ queryKey: ["lunaviaBankAccounts"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Error creating account");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/admin/payment-settings/bank-accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Bank account updated");
      queryClient.invalidateQueries({ queryKey: ["lunaviaBankAccounts"] });
      setDialogOpen(false);
      setEditingAccount(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Error updating method");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/payment-settings/bank-accounts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }
    },
    onSuccess: () => {
      toast.success("Bank account deleted");
      queryClient.invalidateQueries({ queryKey: ["lunaviaBankAccounts"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Error deleting method");
    },
  });

  const resetForm = () => {
    setFormData({
      bankName: "",
      accountName: "",
      accountNumber: "",
      branchName: "",
      qrCodeUrl: "",
      notes: "",
      isActive: true,
    });
  };

  const handleOpenDialog = (account?: any) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        bankName: account.bankName || "",
        accountName: account.accountName || "",
        accountNumber: account.accountNumber || "",
        branchName: account.branchName || "",
        qrCodeUrl: account.qrCodeUrl || "",
        notes: account.notes || "",
        isActive: account.isActive ?? true,
      });
    } else {
      setEditingAccount(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <>
      <PageHeader
        title="Payment Settings"
        description="Manage Lunavia bank account information"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm tài khoản
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Edit Account" : "Add Bank Account"}
                </DialogTitle>
                <DialogDescription>
                  {editingAccount
                    ? "Update Lunavia bank account information"
                    : "Add a new bank account to receive payments from users"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Tên ngân hàng *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      placeholder="e.g. Vietcombank, Techcombank..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Tên chủ tài khoản *</Label>
                    <Input
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) =>
                        setFormData({ ...formData, accountName: e.target.value })
                      }
                      placeholder="Account Holder Name"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Số tài khoản *</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, accountNumber: e.target.value })
                      }
                      placeholder="Account Number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchName">Chi nhánh</Label>
                    <Input
                      id="branchName"
                      value={formData.branchName}
                      onChange={(e) =>
                        setFormData({ ...formData, branchName: e.target.value })
                      }
                      placeholder="Branch (optional)"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="qrCodeUrl">URL QR Code (tùy chọn)</Label>
                  <Input
                    id="qrCodeUrl"
                    type="url"
                    value={formData.qrCodeUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, qrCodeUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notes about this account..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Tài khoản đang hoạt động
                  </Label>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingAccount(null);
                      resetForm();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingAccount ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Tài khoản ngân hàng Lunavia</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading...</p>
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No bank accounts yet"
              description="Add your first bank account so users can make deposits"
            />
          ) : (
            <div className="space-y-4">
              {accounts.map((account: any) => (
                <Card key={account.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{account.bankName}</h3>
                          <StatusBadge
                            status={account.isActive ? "ACTIVE" : "INACTIVE"}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <p className="font-medium text-slate-700">Chủ tài khoản</p>
                            <p>{account.accountName}</p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">Số tài khoản</p>
                            <p className="font-mono">{account.accountNumber}</p>
                          </div>
                          {account.branchName && (
                            <div>
                              <p className="font-medium text-slate-700">Chi nhánh</p>
                              <p>{account.branchName}</p>
                            </div>
                          )}
                          {account.qrCodeUrl && (
                            <div>
                              <p className="font-medium text-slate-700">QR Code</p>
                              <a
                                href={account.qrCodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <QrCode className="h-4 w-4" />
                                Xem QR Code
                              </a>
                            </div>
                          )}
                        </div>
                        {account.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">{account.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(account)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this account?")) {
                              deleteMutation.mutate(account.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}












