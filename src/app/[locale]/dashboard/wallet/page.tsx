"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wallet, DollarSign, Lock, TrendingUp, Plus, Minus,
  ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function WalletPage() {
  const t = useTranslations("Shared.Wallet");
  const [topupOpen, setTopupOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [topupData, setTopupData] = useState({ amount: "", method: "", paymentMethodId: "", customAccountInfo: "" });
  const [withdrawalData, setWithdrawalData] = useState({ amount: "", method: "BANK", paymentMethodId: "", customAccountInfo: "", accountOwnerName: "" });

  const { data: userInfo, refetch } = useQuery({ queryKey: ["userInfo"], queryFn: () => api.user.getInfo() });
  const { data: transactions, refetch: refetchTransactions } = useQuery({ queryKey: ["wallet", "transactions"], queryFn: () => api.wallet.getTransactions() });
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => { try { const r = await fetch("/api/payment-methods"); if (!r.ok) return []; return r.json(); } catch { return []; } },
  });
  const { data: lunaviaAccount } = useQuery({
    queryKey: ["lunaviaAccount"],
    queryFn: async () => { try { const r = await fetch("/api/payment-settings/lunavia-account"); if (!r.ok) return null; return r.json(); } catch { return null; } },
  });

  const wallet = userInfo?.wallet;
  const availableBalance = wallet ? wallet.balance : 0;
  const topUpRequests = transactions?.topUpRequests || [];
  const withdrawalRequests = transactions?.withdrawalRequests || [];
  const payments = transactions?.payments || [];
  const pendingTopUps = topUpRequests.filter((r: any) => r.status === "PENDING");
  const completedTopUps = topUpRequests.filter((r: any) => r.status === "APPROVED");
  const pendingWithdrawals = withdrawalRequests.filter((r: any) => r.status === "PENDING");
  const completedWithdrawals = withdrawalRequests.filter((r: any) => r.status === "APPROVED");

  const handleTopup = async () => {
    try {
      const payload: any = { amount: parseFloat(topupData.amount), method: topupData.method };
      if (topupData.paymentMethodId) payload.paymentMethodId = topupData.paymentMethodId;
      else if (topupData.customAccountInfo) payload.customAccountInfo = topupData.customAccountInfo;
      await api.wallet.topup(payload);
      toast.success("Top-up request created");
      setTopupOpen(false);
      setTopupData({ amount: "", method: "", paymentMethodId: "", customAccountInfo: "" });
      refetch(); refetchTransactions();
    } catch (error: any) { toast.error(error.message || "Error creating request"); }
  };

  const handleWithdrawal = async () => {
    try {
      const payload: any = { amount: parseFloat(withdrawalData.amount), method: withdrawalData.method };
      if (withdrawalData.paymentMethodId) payload.paymentMethodId = withdrawalData.paymentMethodId;
      else if (withdrawalData.customAccountInfo) { payload.customAccountInfo = withdrawalData.customAccountInfo; payload.accountOwnerName = withdrawalData.accountOwnerName; }
      else { toast.error(t("selectPaymentMethod")); return; }
      await api.wallet.withdrawal(payload);
      toast.success("Withdrawal request created");
      setWithdrawalOpen(false);
      setWithdrawalData({ amount: "", method: "BANK", paymentMethodId: "", customAccountInfo: "", accountOwnerName: "" });
      refetch(); refetchTransactions();
    } catch (error: any) { toast.error(error.message || "Error creating request"); }
  };

  const allTransactions = [
    ...topUpRequests.map((r: any) => ({ ...r, type: "topup", amount: r.amount, isPositive: true })),
    ...withdrawalRequests.map((r: any) => ({ ...r, type: "withdrawal", amount: r.amount, isPositive: false })),
    ...payments.map((p: any) => ({ ...p, type: p.fromWalletId === wallet?.id ? "payment_sent" : "payment_received", amount: p.amount, isPositive: p.toWalletId === wallet?.id })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} action={
        <div className="flex gap-2">
          <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-500"><Plus className="h-4 w-4 mr-2" />{t("topup")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("topupTitle")}</DialogTitle><DialogDescription>{t("topupDesc")}</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div><Label>{t("amount")}</Label><Input type="number" value={topupData.amount} onChange={(e) => setTopupData({ ...topupData, amount: e.target.value })} placeholder={t("enterAmount")} /></div>
                <div><Label>{t("method")}</Label>
                  <Select value={topupData.method} onValueChange={(v) => setTopupData({ ...topupData, method: v, paymentMethodId: "", customAccountInfo: "" })}>
                    <SelectTrigger><SelectValue placeholder={t("selectMethod")} /></SelectTrigger>
                    <SelectContent><SelectItem value="BANK">{t("bankTransfer")}</SelectItem><SelectItem value="MOMO">MoMo</SelectItem><SelectItem value="ZALO">ZaloPay</SelectItem></SelectContent>
                  </Select>
                </div>
                {topupData.method === "BANK" && lunaviaAccount && (
                  <div className="p-4 bg-lunavia-light border border-lunavia-muted/60 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">{t("receivingAccountInfo")}</p>
                    <div className="text-sm text-lunavia-primary-hover space-y-1">
                      <p><span className="font-medium">{t("bank")}</span> {lunaviaAccount.bankName}</p>
                      <p><span className="font-medium">{t("accountHolder")}</span> {lunaviaAccount.accountName}</p>
                      <p><span className="font-medium">{t("accountNumber")}</span> <span className="font-mono">{lunaviaAccount.accountNumber}</span></p>
                      {lunaviaAccount.branchName && <p><span className="font-medium">{t("branch")}</span> {lunaviaAccount.branchName}</p>}
                      {lunaviaAccount.qrCodeUrl && <div className="mt-2"><a href={lunaviaAccount.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-lunavia-primary hover:underline">{t("viewQR")}</a></div>}
                    </div>
                  </div>
                )}
                {topupData.method !== "BANK" && topupData.method && (
                  <div><Label>{t("selectSavedOrNew")}</Label>
                    <Select value={topupData.paymentMethodId || "custom"} onValueChange={(v) => setTopupData({ ...topupData, paymentMethodId: v === "custom" ? "" : v, customAccountInfo: v === "custom" ? topupData.customAccountInfo : "" })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="custom">{t("enterNew")}</SelectItem>{paymentMethods.filter((m: any) => m.type === topupData.method).map((m: any) => <SelectItem key={m.id} value={m.id}>{m.accountName} - {m.accountNumber}{m.isDefault && " (Default)"}</SelectItem>)}</SelectContent>
                    </Select>
                    {(!topupData.paymentMethodId || topupData.paymentMethodId === "custom") && <Input className="mt-2" value={topupData.customAccountInfo} onChange={(e) => setTopupData({ ...topupData, customAccountInfo: e.target.value })} placeholder={topupData.method === "MOMO" || topupData.method === "ZALO" ? "Phone Number" : "Account Details"} />}
                  </div>
                )}
                <Button onClick={handleTopup} className="w-full">{t("createRequest")}</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Minus className="h-4 w-4 mr-2" />{t("withdraw")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("withdrawTitle")}</DialogTitle><DialogDescription>{t("withdrawDesc")}</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div><Label>{t("amount")}</Label><Input type="number" value={withdrawalData.amount} onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })} placeholder={t("enterAmount")} /><p className="text-xs text-slate-500 mt-1">{t("availableBalance", { amount: formatVND(availableBalance) })}</p></div>
                <div><Label>{t("method")}</Label>
                  <Select value={withdrawalData.method} onValueChange={(v) => setWithdrawalData({ ...withdrawalData, method: v, paymentMethodId: "", customAccountInfo: "", accountOwnerName: "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="BANK">{t("bankTransferShort")}</SelectItem><SelectItem value="MOMO">MoMo</SelectItem><SelectItem value="ZALO">ZaloPay</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>{t("selectSavedOrNew")}</Label>
                  <Select value={withdrawalData.paymentMethodId || "custom"} onValueChange={(v) => setWithdrawalData({ ...withdrawalData, paymentMethodId: v === "custom" ? "" : v, customAccountInfo: v === "custom" ? withdrawalData.customAccountInfo : "", accountOwnerName: v === "custom" ? withdrawalData.accountOwnerName : "" })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="custom">{t("enterNew")}</SelectItem>{paymentMethods.filter((m: any) => m.type === withdrawalData.method).map((m: any) => <SelectItem key={m.id} value={m.id}>{m.accountName} - {m.accountNumber}{m.isDefault && " (Default)"}{m.isVerified && " ✓"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(!withdrawalData.paymentMethodId || withdrawalData.paymentMethodId === "custom") && (
                  <>
                    <div><Label>{t("accountInfo")}</Label><Input value={withdrawalData.customAccountInfo} onChange={(e) => setWithdrawalData({ ...withdrawalData, customAccountInfo: e.target.value })} placeholder={withdrawalData.method === "BANK" ? "Account Number" : "Phone Number"} required={!withdrawalData.paymentMethodId} /></div>
                    <div><Label>{t("accountOwnerName")}</Label><Input value={withdrawalData.accountOwnerName} onChange={(e) => setWithdrawalData({ ...withdrawalData, accountOwnerName: e.target.value })} placeholder="Account holder name" required={!withdrawalData.paymentMethodId} /><p className="text-xs text-slate-500 mt-1">{t("nameMustMatch")}</p></div>
                  </>
                )}
                {withdrawalData.paymentMethodId && <div className="p-3 bg-lunavia-light border border-lunavia-muted/60 rounded-lg"><p className="text-sm text-lunavia-primary-hover">{t("usingSavedMethod")}</p></div>}
                <Button onClick={handleWithdrawal} className="w-full">{t("createRequest")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      } />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title={t("totalBalance")} value={wallet ? formatVND(wallet.balance) : formatVND(0)} icon={Wallet} />
        <StatsCard title={t("lockedDeposit")} value={formatVND(0)} icon={Lock} />
        <StatsCard title={t("availableBalanceLabel")} value={formatVND(availableBalance)} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader><CardTitle>{t("transactionHistory")}</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
              <TabsTrigger value="requests">{t("requests")}</TabsTrigger>
              <TabsTrigger value="deposits">{t("deposited")}</TabsTrigger>
              <TabsTrigger value="withdrawals">{t("withdrawn")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {allTransactions.length === 0 ? <EmptyState icon={DollarSign} title="No transactions yet" description="Transactions will appear here" /> : (
                <div className="space-y-3">
                  {allTransactions.map((tx: any, i: number) => (
                    <div key={`${tx.type}-${tx.id}-${i}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {tx.type === "topup" || tx.type === "payment_received" ? <ArrowUpCircle className="h-5 w-5 text-emerald-600" /> : <ArrowDownCircle className="h-5 w-5 text-red-600" />}
                        <div>
                          <p className="font-medium text-slate-900">{tx.type === "topup" ? "Top-up Request" : tx.type === "withdrawal" ? "Withdrawal Request" : tx.type === "payment_sent" ? t("paymentTo", { name: tx.toWallet?.user?.profile?.name || tx.toWallet?.user?.email }) : t("paymentFrom", { name: tx.fromWallet?.user?.profile?.name || tx.fromWallet?.user?.email })}</p>
                          <p className="text-sm text-slate-500">{formatDateTime(tx.createdAt)}</p>
                          {tx.tour && <p className="text-xs text-slate-400">Tour: {tx.tour.title}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.isPositive ? "text-emerald-600" : "text-red-600"}`}>{tx.isPositive ? "+" : "-"}{formatVND(tx.amount)}</p>
                        {tx.status && <StatusBadge status={tx.status} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <div className="space-y-4">
                {pendingTopUps.length > 0 && <div><h3 className="font-semibold mb-2 flex items-center gap-2"><Clock className="h-4 w-4" />{t("pendingTopupRequests")}</h3><div className="space-y-2">{pendingTopUps.map((r: any) => <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg"><div><p className="font-medium">{formatVND(r.amount)} - {r.method}</p><p className="text-sm text-slate-500">{formatDateTime(r.createdAt)}</p></div><StatusBadge status={r.status} /></div>)}</div></div>}
                {pendingWithdrawals.length > 0 && <div><h3 className="font-semibold mb-2 flex items-center gap-2"><Clock className="h-4 w-4" />{t("pendingWithdrawalRequests")}</h3><div className="space-y-2">{pendingWithdrawals.map((r: any) => <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg"><div><p className="font-medium">{formatVND(r.amount)} - {r.method}</p><p className="text-sm text-slate-500">{formatDateTime(r.createdAt)}</p>{(r.customAccountInfo || r.paymentMethod?.accountNumber) && <p className="text-xs text-slate-400">{r.customAccountInfo || `${r.paymentMethod?.accountName} - ${r.paymentMethod?.accountNumber}`}</p>}</div><StatusBadge status={r.status} /></div>)}</div></div>}
                {pendingTopUps.length === 0 && pendingWithdrawals.length === 0 && <EmptyState icon={Clock} title="No pending requests" description="Pending requests will appear here" />}
              </div>
            </TabsContent>

            <TabsContent value="deposits" className="mt-4">
              {completedTopUps.length === 0 ? <EmptyState icon={ArrowUpCircle} title="No top-up transactions yet" description="Completed top-up transactions will appear here" /> : (
                <div className="space-y-3">{completedTopUps.map((r: any) => <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg"><div className="flex items-center gap-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="font-medium">{t("topupMethod", { method: r.method })}</p><p className="text-sm text-slate-500">{formatDateTime(r.processedAt || r.createdAt)}</p></div></div><div className="text-right"><p className="font-semibold text-emerald-600">+{formatVND(r.amount)}</p><StatusBadge status={r.status} /></div></div>)}</div>
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-4">
              {completedWithdrawals.length === 0 ? <EmptyState icon={ArrowDownCircle} title="No withdrawal transactions yet" description="Completed withdrawal transactions will appear here" /> : (
                <div className="space-y-3">{completedWithdrawals.map((r: any) => <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg"><div className="flex items-center gap-4"><CheckCircle2 className="h-5 w-5 text-lunavia-primary" /><div><p className="font-medium">{t("withdrawMethod", { method: r.method })}</p><p className="text-sm text-slate-500">{formatDateTime(r.processedAt || r.createdAt)}</p>{(r.customAccountInfo || r.paymentMethod?.accountNumber) && <p className="text-xs text-slate-400">{r.customAccountInfo || `${r.paymentMethod?.accountName} - ${r.paymentMethod?.accountNumber}`}</p>}</div></div><div className="text-right"><p className="font-semibold text-red-600">-{formatVND(r.amount)}</p><StatusBadge status={r.status} /></div></div>)}</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
