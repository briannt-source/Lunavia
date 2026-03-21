"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PermissionService } from "@/application/services/permission.service";
import { AdminRole, Permission } from "@prisma/client";
import { Shield, Save, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminAdminsPage() {
  const queryClient = useQueryClient();
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<AdminRole | "">("");

  // Fetch admin users
  const { data: adminsData, isLoading } = useQuery({
    queryKey: ["admin-admins"],
    queryFn: async () => {
      const response = await fetch("/api/admin/admins");
      if (!response.ok) throw new Error("Failed to fetch admin users");
      return response.json();
    },
  });

  const admins = adminsData?.admins || [];

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      adminId,
      permissions,
      role,
    }: {
      adminId: string;
      permissions?: Permission[];
      role?: AdminRole;
    }) => {
      const response = await fetch(`/api/admin/admins/${adminId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions, role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update permissions");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
      setEditingAdmin(null);
      setSelectedPermissions([]);
      setSelectedRole("");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin.id);
    setSelectedPermissions([...admin.permissions]);
    setSelectedRole(admin.role);
  };

  const handleCancel = () => {
    setEditingAdmin(null);
    setSelectedPermissions([]);
    setSelectedRole("");
  };

  const handleSave = (adminId: string) => {
    updatePermissionsMutation.mutate({
      adminId,
      permissions: selectedPermissions,
      role: selectedRole || undefined,
    });
  };

  const togglePermission = (permission: Permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const permissionsByCategory = PermissionService.getPermissionsByCategory();

  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage Admin Users"
        description="Manage access permissions for admin users in the system"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Danh sách Admin Users ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>Chưa có admin user nào</p>
            </div>
          ) : (
            <div className="space-y-6">
              {admins.map((admin: any) => {
                const isEditing = editingAdmin === admin.id;
                const currentPermissions = isEditing
                  ? selectedPermissions
                  : admin.permissions;
                const currentRole = isEditing ? selectedRole : admin.role;

                return (
                  <div
                    key={admin.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{admin.email}</h3>
                        <p className="text-sm text-slate-500">
                          Role: {currentRole.replace(/_/g, " ")}
                        </p>
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => handleEdit(admin)}>
                          Chỉnh sửa quyền
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={updatePermissionsMutation.isPending}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={() => handleSave(admin.id)}
                            disabled={updatePermissionsMutation.isPending}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Lưu
                          </Button>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="space-y-4">
                        <div>
                          <Label>Role</Label>
                          <Select
                            value={currentRole}
                            onValueChange={(value) =>
                              setSelectedRole(value as AdminRole)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(AdminRole).map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {Object.entries(permissionsByCategory).map(
                        ([category, permissions]) => (
                          <div key={category}>
                            <h4 className="font-medium text-sm mb-2">
                              {category}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {permissions.map((permission) => {
                                const hasPermission = currentPermissions.includes(
                                  permission
                                );
                                const isDefault = admin.defaultPermissions?.includes(
                                  permission
                                );

                                return (
                                  <div
                                    key={permission}
                                    className="flex items-center space-x-2"
                                  >
                                    {isEditing ? (
                                      <Checkbox
                                        checked={hasPermission}
                                        onCheckedChange={() =>
                                          togglePermission(permission)
                                        }
                                      />
                                    ) : (
                                      <Checkbox
                                        checked={hasPermission}
                                        disabled
                                      />
                                    )}
                                    <Label className="text-sm font-normal">
                                      {permission.replace(/_/g, " ")}
                                      {isDefault && !hasPermission && (
                                        <span className="text-xs text-slate-400 ml-1">
                                          (default)
                                        </span>
                                      )}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

