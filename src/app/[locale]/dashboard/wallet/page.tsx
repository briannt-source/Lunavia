"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  DollarSign,
  Lock,
  TrendingUp,
  Plus,
  Minus,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function WalletPage() {
  const [topupOpen, setTopupOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [topupData, setTopupData] = useState({ 
    amount: "", 
    method: "",
    paymentMethodId: "",
    customAccountInfo: "",
  });
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    method: "BANK",
    paymentMethodId: "",
    customAccountInfo: "",
    accountOwnerName: "",
  });

  const { data: userInfo, refetch } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => api.user.getInfo(),
  });

  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: () => api.wallet.getTransactions(),
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/payment-methods");
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
  });

  const { data: lunaviaAccount } = useQuery({
    queryKey: ["lunaviaAccount"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/payment-settings/lunavia-account");
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    },
  });

  const wallet = userInfo?.wallet;

  const handleTopup = async () => {
    try {
      const payload: any = {
        amount: parseFloat(topupData.amount),
        method: topupData.method,
      };
      
      if (topupData.paymentMethodId) {
        payload.paymentMethodId = topupData.paymentMethodId;
      } else if (topupData.customAccountInfo) {
        payload.customAccountInfo = topupData.customAccountInfo;
      }

      await api.wallet.topup(payload);
      toast.success("Top-up request created");
      setTopupOpen(false);
      setTopupData({ amount: "", method: "", paymentMethodId: "", customAccountInfo: "" });
      refetch();
      refetchTransactions();
    } catch (error: any) {
      toast.error(error.message || "Error creating request");
    }
  };

  const handleWithdrawal = async () => {
    try {
      const payload: any = {
        amount: parseFloat(withdrawalData.amount),
        method: withdrawalData.method,
      };
      
      if (withdrawalData.paymentMethodId) {
        payload.paymentMethodId = withdrawalData.paymentMethodId;
      } else if (withdrawalData.customAccountInfo) {
        payload.customAccountInfo = withdrawalData.customAccountInfo;
        payload.accountOwnerName = withdrawalData.accountOwnerName;
      } else {
        toast.error("Please select a payment method or enter account details");
        return;
      }

      await api.wallet.withdrawal(payload);
      toast.success("Withdrawal request created");
      setWithdrawalOpen(false);
      setWithdrawalData({ 
        amount: "", 
        method: "BANK", 
        paymentMethodId: "", 
        customAccountInfo: "",
        accountOwnerName: "",
      });
      refetch();
      refetchTransactions();
    } catch (error: any) {
      toast.error(error.message || "Error creating request");
    }
  };

  const availableBalance =
    wallet ? wallet.balance
      : 0;

  const topUpRequests = transactions?.topUpRequests || [];
  const withdrawalRequests = transactions?.withdrawalRequests || [];
  const payments = transactions?.payments || [];

  // Filter transactions by status
  const pendingTopUps = topUpRequests.filter(
    (r: any) => r.status === "PENDING"
  );
  const completedTopUps = topUpRequests.filter(
    (r: any) => r.status === "APPROVED"
  );
  const pendingWithdrawals = withdrawalRequests.filter(
    (r: any) => r.status === "PENDING"
  );
  const completedWithdrawals = withdrawalRequests.filter(
    (r: any) => r.status === "APPROVED"
  );

  // All transactions combined for overview
  const allTransactions = [
    ...topUpRequests.map((r: any) => ({
      ...r,
      type: "topup",
      amount: r.amount,
      isPositive: true,
    })),
    ...withdrawalRequests.map((r: any) => ({
      ...r,
      type: "withdrawal",
      amount: r.amount,
      isPositive: false,
    })),
    ...payments.map((p: any) => ({
      ...p,
      type: p.fromWalletId === wallet?.id ? "payment_sent" : "payment_received",
      amount: p.amount,
      isPositive: p.toWalletId === wallet?.id,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <PageHeader
        title="My Wallet"
        description="Manage your balance and transactions"
        action={
          <div className="flex gap-2">
            <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-teal-500 to-emerald-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Nạp tiền
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nạp tiền</DialogTitle>
                  <DialogDescription>
                    Tạo yêu cầu nạp tiền vào ví
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Amount (VND)</Label>
                    <Input
                      type="number"
                      value={topupData.amount}
                      onChange={(e) =>
                        setTopupData({ ...topupData, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label>Phương thức</Label>
                    <Select
                      value={topupData.method}
                      onValueChange={(value) =>
                        setTopupData({ ...topupData, method: value, paymentMethodId: "", customAccountInfo: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK">Chuyển khoản ngân hàng (Lunavia)</SelectItem>
                        <SelectItem value="MOMO">MoMo</SelectItem>
                        <SelectItem value="ZALO">ZaloPay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Lunavia bank account info when BANK is selected */}
                  {topupData.method === "BANK" && lunaviaAccount && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Information tài khoản nhận tiền:
                      </p>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>
                          <span className="font-medium">Ngân hàng:</span> {lunaviaAccount.bankName}
                        </p>
                        <p>
                          <span className="font-medium">Chủ tài khoản:</span> {lunaviaAccount.accountName}
                        </p>
                        <p>
                          <span className="font-medium">Account number:</span>{" "}
                          <span className="font-mono">{lunaviaAccount.accountNumber}</span>
                        </p>
                        {lunaviaAccount.branchName && (
                          <p>
                            <span className="font-medium">Chi nhánh:</span> {lunaviaAccount.branchName}
                          </p>
                        )}
                        {lunaviaAccount.qrCodeUrl && (
                          <div className="mt-2">
                            <a
                              href={lunaviaAccount.qrCodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Xem QR Code
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* For other methods, show payment method selector or custom input */}
                  {topupData.method !== "BANK" && topupData.method && (
                    <div>
                      <Label>Chọn phương thức đã lưu hoặc nhập mới</Label>
                      <Select
                        value={topupData.paymentMethodId || "custom"}
                        onValueChange={(value) =>
                          setTopupData({ 
                            ...topupData, 
                            paymentMethodId: value === "custom" ? "" : value,
                            customAccountInfo: value === "custom" ? topupData.customAccountInfo : "",
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Nhập information mới</SelectItem>
                          {paymentMethods
                            .filter((m: any) => m.type === topupData.method)
                            .map((method: any) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.accountName} - {method.accountNumber}
                                {method.isDefault && " (Default)"}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {(!topupData.paymentMethodId || topupData.paymentMethodId === "custom") && (
                        <Input
                          className="mt-2"
                          value={topupData.customAccountInfo}
                          onChange={(e) =>
                            setTopupData({ ...topupData, customAccountInfo: e.target.value })
                          }
                          placeholder={
                            topupData.method === "MOMO" || topupData.method === "ZALO"
                              ? "Phone Number"
                              : "Account Details"
                          }
                        />
                      )}
                    </div>
                  )}

                  <Button onClick={handleTopup} className="w-full">
                    Tạo yêu cầu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Minus className="h-4 w-4 mr-2" />
                  Rút tiền
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rút tiền</DialogTitle>
                  <DialogDescription>
                    Tạo yêu cầu rút tiền từ ví
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Amount (VND)</Label>
                    <Input
                      type="number"
                      value={withdrawalData.amount}
                      onChange={(e) =>
                        setWithdrawalData({
                          ...withdrawalData,
                          amount: e.target.value,
                        })
                      }
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Số dư khả dụng: {formatVND(availableBalance)}
                    </p>
                  </div>
                  <div>
                    <Label>Phương thức</Label>
                    <Select
                      value={withdrawalData.method}
                      onValueChange={(value) =>
                        setWithdrawalData({
                          ...withdrawalData,
                          method: value,
                          paymentMethodId: "",
                          customAccountInfo: "",
                          accountOwnerName: "",
                        })
                      }
                    >
                      <SelectTrigger>
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
                    <Label>Chọn phương thức đã lưu hoặc nhập mới</Label>
                    <Select
                      value={withdrawalData.paymentMethodId || "custom"}
                      onValueChange={(value) =>
                        setWithdrawalData({
                          ...withdrawalData,
                          paymentMethodId: value === "custom" ? "" : value,
                          customAccountInfo: value === "custom" ? withdrawalData.customAccountInfo : "",
                          accountOwnerName: value === "custom" ? withdrawalData.accountOwnerName : "",
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Nhập information mới</SelectItem>
                        {paymentMethods
                          .filter((m: any) => m.type === withdrawalData.method)
                          .map((method: any) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.accountName} - {method.accountNumber}
                              {method.isDefault && " (Default)"}
                              {method.isVerified && " ✓"}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(!withdrawalData.paymentMethodId || withdrawalData.paymentMethodId === "custom") && (
                    <>
                      <div>
                        <Label>Information tài khoản *</Label>
                        <Input
                          value={withdrawalData.customAccountInfo}
                          onChange={(e) =>
                            setWithdrawalData({
                              ...withdrawalData,
                              customAccountInfo: e.target.value,
                            })
                          }
                          placeholder={
                            withdrawalData.method === "BANK"
                              ? "Account Number"
                              : "Phone Number"
                          }
                          required={!withdrawalData.paymentMethodId}
                        />
                      </div>
                      <div>
                        <Label>Tên chủ tài khoản *</Label>
                        <Input
                          value={withdrawalData.accountOwnerName}
                          onChange={(e) =>
                            setWithdrawalData({
                              ...withdrawalData,
                              accountOwnerName: e.target.value,
                            })
                          }
                          placeholder="Account holder name (for confirmation)"
                          required={!withdrawalData.paymentMethodId}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Tên này phải khớp với tên trong hồ sơ của bạn
                        </p>
                      </div>
                    </>
                  )}

                  {withdrawalData.paymentMethodId && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Sử dụng phương thức đã lưu. Information sẽ được tự động điền.
                      </p>
                    </div>
                  )}

                  <Button onClick={handleWithdrawal} className="w-full">
                    Tạo yêu cầu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Balance"
          value={wallet ? formatVND(wallet.balance) : formatVND(0)}
          icon={Wallet}
        />
        <StatsCard
          title="Locked Deposit"
          value={formatVND(0)}
          icon={Lock}
        />
        <StatsCard
          title="Available Balance"
          value={formatVND(availableBalance)}
          icon={TrendingUp}
        />
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="requests">Requirements</TabsTrigger>
              <TabsTrigger value="deposits">Đã nạp</TabsTrigger>
              <TabsTrigger value="withdrawals">Đã rút</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4">
              {allTransactions.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No transactions yet"
                  description="Transactions will appear here"
                />
              ) : (
                <div className="space-y-3">
                  {allTransactions.map((tx: any, index: number) => (
                    <div
                      key={`${tx.type}-${tx.id}-${index}`}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {tx.type === "topup" || tx.type === "payment_received" ? (
                          <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {tx.type === "topup"
                              ? "Top-up Request"
                              : tx.type === "withdrawal"
                              ? "Withdrawal Request"
                              : tx.type === "payment_sent"
                              ? `Thanh toán cho ${tx.toWallet?.user?.profile?.name || tx.toWallet?.user?.email}`
                              : `Thanh toán từ ${tx.fromWallet?.user?.profile?.name || tx.fromWallet?.user?.email}`}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDateTime(tx.createdAt)}
                          </p>
                          {tx.tour && (
                            <p className="text-xs text-slate-400">
                              Tour: {tx.tour.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            tx.isPositive ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {tx.isPositive ? "+" : "-"}
                          {formatVND(tx.amount)}
                        </p>
                        {tx.status && <StatusBadge status={tx.status} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="mt-4">
              <div className="space-y-4">
                {/* Pending Top-ups */}
                {pendingTopUps.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Requirements nạp tiền đang chờ
                    </h3>
                    <div className="space-y-2">
                      {pendingTopUps.map((r: any) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {formatVND(r.amount)} - {r.method}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatDateTime(r.createdAt)}
                            </p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Withdrawals */}
                {pendingWithdrawals.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Requirements rút tiền đang chờ
                    </h3>
                    <div className="space-y-2">
                      {pendingWithdrawals.map((r: any) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {formatVND(r.amount)} - {r.method}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatDateTime(r.createdAt)}
                            </p>
                            {(r.customAccountInfo || r.paymentMethod?.accountNumber) && (
                              <p className="text-xs text-slate-400">
                                {r.customAccountInfo || 
                                 `${r.paymentMethod?.accountName} - ${r.paymentMethod?.accountNumber}`}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingTopUps.length === 0 &&
                  pendingWithdrawals.length === 0 && (
                    <EmptyState
                      icon={Clock}
                      title="No pending requests"
                      description="Pending requests will appear here"
                    />
                  )}
              </div>
            </TabsContent>

            {/* Deposits Tab */}
            <TabsContent value="deposits" className="mt-4">
              {completedTopUps.length === 0 ? (
                <EmptyState
                  icon={ArrowUpCircle}
                  title="No top-up transactions yet"
                  description="Completed top-up transactions will appear here"
                />
              ) : (
                <div className="space-y-3">
                  {completedTopUps.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium">
                            Nạp tiền - {r.method}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDateTime(r.processedAt || r.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">
                          +{formatVND(r.amount)}
                        </p>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Withdrawals Tab */}
            <TabsContent value="withdrawals" className="mt-4">
              {completedWithdrawals.length === 0 ? (
                <EmptyState
                  icon={ArrowDownCircle}
                  title="No withdrawal transactions yet"
                  description="Completed withdrawal transactions will appear here"
                />
              ) : (
                <div className="space-y-3">
                  {completedWithdrawals.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            Rút tiền - {r.method}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDateTime(r.processedAt || r.createdAt)}
                          </p>
                          {(r.customAccountInfo || r.paymentMethod?.accountNumber) && (
                            <p className="text-xs text-slate-400">
                              {r.customAccountInfo || 
                               `${r.paymentMethod?.accountName} - ${r.paymentMethod?.accountNumber}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          -{formatVND(r.amount)}
                        </p>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
