"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreditCard, Plus, Edit, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";

export default function PaymentMethodsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [verifyingMethod, setVerifyingMethod] = useState<any>(null);
  const [accountOwnerName, setAccountOwnerName] = useState("");
  const [formData, setFormData] = useState({
    type: "BANK",
    accountName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    isDefault: false,
  });

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const response = await fetch("/api/payment-methods");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/payment-methods", {
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
      toast.success("Đã thêm phương thức thanh toán");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi thêm phương thức");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/payment-methods/${id}`, {
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
      toast.success("Đã cập nhật phương thức thanh toán");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      setDialogOpen(false);
      setEditingMethod(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi cập nhật");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }
    },
    onSuccess: () => {
      toast.success("Đã xóa phương thức thanh toán");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi xóa");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, accountOwnerName }: { id: string; accountOwnerName: string }) => {
      const response = await fetch(`/api/payment-methods/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountOwnerName }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Đã xác nhận chủ tài khoản");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      setVerifyDialogOpen(false);
      setVerifyingMethod(null);
      setAccountOwnerName("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi xác nhận");
    },
  });

  const resetForm = () => {
    setFormData({
      type: "BANK",
      accountName: "",
      accountNumber: "",
      bankName: "",
      branchName: "",
      isDefault: false,
    });
  };

  const handleOpenDialog = (method?: any) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        type: method.type || "BANK",
        accountName: method.accountName || "",
        accountNumber: method.accountNumber || "",
        bankName: method.bankName || "",
        branchName: method.branchName || "",
        isDefault: method.isDefault || false,
      });
    } else {
      setEditingMethod(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingMethod || !accountOwnerName.trim()) {
      toast.error("Vui lòng nhập tên chủ tài khoản");
      return;
    }
    verifyMutation.mutate({ id: verifyingMethod.id, accountOwnerName });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Phương thức thanh toán"
        description="Quản lý các phương thức thanh toán đã lưu"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm phương thức
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? "Chỉnh sửa phương thức" : "Thêm phương thức thanh toán"}
                </DialogTitle>
                <DialogDescription>
                  {editingMethod
                    ? "Cập nhật thông tin phương thức thanh toán"
                    : "Lưu thông tin phương thức thanh toán để sử dụng nhanh"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Loại phương thức *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK">Chuyển khoản ngân hàng</SelectItem>
                      <SelectItem value="MOMO">MoMo</SelectItem>
                      <SelectItem value="ZALO">ZaloPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountName">Tên chủ tài khoản *</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    placeholder="Tên chủ tài khoản"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">
                    {formData.type === "BANK" ? "Số tài khoản" : "Số điện thoại"} *
                  </Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, accountNumber: e.target.value })
                    }
                    placeholder={
                      formData.type === "BANK" ? "Số tài khoản" : "Số điện thoại"
                    }
                    required
                  />
                </div>
                {formData.type === "BANK" && (
                  <>
                    <div>
                      <Label htmlFor="bankName">Tên ngân hàng *</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        placeholder="VD: Vietcombank, Techcombank..."
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
                        placeholder="Chi nhánh (tùy chọn)"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Đặt làm mặc định
                  </Label>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setEditingMethod(null);
                      resetForm();
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingMethod ? "Cập nhật" : "Thêm"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Phương thức đã lưu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Đang tải...</p>
            </div>
          ) : methods.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Chưa có phương thức thanh toán"
              description="Thêm phương thức thanh toán để sử dụng nhanh khi nạp/rút tiền"
            />
          ) : (
            <div className="space-y-4">
              {methods.map((method: any) => (
                <Card key={method.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">
                            {method.type === "BANK"
                              ? "Chuyển khoản ngân hàng"
                              : method.type === "MOMO"
                              ? "MoMo"
                              : "ZaloPay"}
                          </h3>
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Mặc định
                            </span>
                          )}
                          {method.isVerified ? (
                            <StatusBadge status="VERIFIED" />
                          ) : (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Chưa xác nhận
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <p className="font-medium text-slate-700">Chủ tài khoản</p>
                            <p>{method.accountName}</p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">
                              {method.type === "BANK" ? "Số tài khoản" : "Số điện thoại"}
                            </p>
                            <p className="font-mono">{method.accountNumber}</p>
                          </div>
                          {method.bankName && (
                            <div>
                              <p className="font-medium text-slate-700">Ngân hàng</p>
                              <p>{method.bankName}</p>
                            </div>
                          )}
                          {method.branchName && (
                            <div>
                              <p className="font-medium text-slate-700">Chi nhánh</p>
                              <p>{method.branchName}</p>
                            </div>
                          )}
                        </div>
                        {method.isVerified && method.verifiedAt && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Đã xác nhận chủ tài khoản vào{" "}
                              {new Date(method.verifiedAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!method.isVerified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVerifyingMethod(method);
                              setVerifyDialogOpen(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Xác nhận
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(method)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm("Bạn có chắc muốn xóa phương thức này?")) {
                              deleteMutation.mutate(method.id);
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

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận chủ tài khoản</DialogTitle>
            <DialogDescription>
              Nhập tên chủ tài khoản để xác nhận. Tên này phải khớp với tên trong hồ sơ của bạn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="accountOwnerName">Tên chủ tài khoản *</Label>
              <Input
                id="accountOwnerName"
                value={accountOwnerName}
                onChange={(e) => setAccountOwnerName(e.target.value)}
                placeholder="Nhập tên chủ tài khoản"
                required
              />
              {verifyingMethod && (
                <p className="text-xs text-slate-500 mt-1">
                  Tên chủ tài khoản: {verifyingMethod.accountName}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerifyDialogOpen(false);
                  setVerifyingMethod(null);
                  setAccountOwnerName("");
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={verifyMutation.isPending}>
                {verifyMutation.isPending ? "Đang xác nhận..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}












