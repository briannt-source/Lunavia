"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatDateTime, formatVND } from "@/lib/utils";
import { Users, Search, Mail, Shield, Wallet, MapPin, AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";
import { Link } from '@/navigation';
import { useSearchParams, useRouter } from "next/navigation";
import { UserModerationDialog } from "@/components/user-moderation-dialog";
import { AdminDeleteUserDialog } from "@/components/admin-delete-user-dialog";
import { api } from "@/lib/api-client";

export default function AdminUsersClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [moderationDialog, setModerationDialog] = useState<{
    open: boolean;
    user: any;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: any;
  } | null>(null);

  const role = searchParams.get("role") || "all";
  const search = searchParams.get("search") || "";
  const verified = searchParams.get("verified") || "all";

  const { data: usersData, refetch } = useQuery({
    queryKey: ["admin-users", role, search, verified],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role !== "all") params.append("role", role);
      if (search) params.append("search", search);
      if (verified !== "all") params.append("verified", verified);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const users = usersData?.users || [];
  const stats = usersData?.stats || {};

  const handleFilter = (newRole: string, newSearch: string, newVerified: string) => {
    const params = new URLSearchParams();
    if (newRole !== "all") params.append("role", newRole);
    if (newSearch) params.append("search", newSearch);
    if (newVerified !== "all") params.append("verified", newVerified);
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  return (
    <>
      <PageHeader
        title="Manage Users"
        description="Manage all users. Users violating policies can be blocked/unblocked or deleted."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats["TOUR_OPERATOR"] || 0) +
                (stats["TOUR_AGENCY"] || 0) +
                (stats["TOUR_GUIDE"] || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats["TOUR_OPERATOR"] || 0) + (stats["TOUR_AGENCY"] || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guides</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats["TOUR_GUIDE"] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bị block</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter((u: any) => u.isBlocked).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by email or name..."
                  defaultValue={search}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const searchInput = e.currentTarget.value;
                      handleFilter(role, searchInput, verified);
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={role}
              onValueChange={(value) => handleFilter(value, search, verified)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="TOUR_OPERATOR">Tour Operator</SelectItem>
                <SelectItem value="TOUR_AGENCY">Tour Agency</SelectItem>
                <SelectItem value="TOUR_GUIDE">Tour Guide</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={verified}
              onValueChange={(value) => handleFilter(role, search, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="APPROVED">Đã xác minh</SelectItem>
                <SelectItem value="PENDING">Đang chờ</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="NOT_SUBMITTED">Chưa nộp</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const searchInput = document.querySelector("input[placeholder='Search by email or name...']") as HTMLInputElement;
                handleFilter(role, searchInput?.value || "", verified);
              }}
            >
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>User not found nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {user.profile?.name || user.email || "N/A"}
                        </h3>
                        {user.verifiedStatus === "APPROVED" && (
                          <VerifiedBadge
                            type={user.role === "TOUR_GUIDE" ? "KYC" : "KYB"}
                          />
                        )}
                        <StatusBadge status={user.verifiedStatus} />
                        {user.isBlocked && (
                          <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Đã block
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                          {user.role.replace(/_/g, " ")}
                        </span>
                        {user.wallet && (
                          <span className="flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {formatVND(user.wallet.balance)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        {user._count?.tours > 0 && (
                          <span>{user._count.tours} tours</span>
                        )}
                        {user._count?.applications > 0 && (
                          <span>{user._count.applications} applications</span>
                        )}
                        <span>Register: {formatDateTime(user.createdAt)}</span>
                        {user.isBlocked && user.blockReason && (
                          <span className="text-red-600">
                            Reason: {user.blockReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </Link>
                    <Button
                      variant={user.isBlocked ? "default" : "destructive"}
                      size="sm"
                      onClick={() =>
                        setModerationDialog({
                          open: true,
                          user,
                        })
                      }
                    >
                      {user.isBlocked ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Block
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          user,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {moderationDialog && (
        <UserModerationDialog
          open={moderationDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setModerationDialog(null);
            }
          }}
          user={moderationDialog.user}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            refetch();
            setModerationDialog(null);
          }}
        />
      )}

      {deleteDialog && (
        <AdminDeleteUserDialog
          open={deleteDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteDialog(null);
            }
          }}
          user={deleteDialog.user}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            refetch();
            setDeleteDialog(null);
          }}
        />
      )}
    </>
  );
}

