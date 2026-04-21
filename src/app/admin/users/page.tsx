"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Edit,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  X,
  Shield,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  updateUser,
  toggleUserStatus,
} from "@/lib/actions";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  deactivated: boolean;
  deletedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/account");
      return;
    }
  }, [session, status, router]);

  // React Query hook for fetching users
  const {
    data: usersData,
    isLoading: loading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const result = await getAllUsers();
      if (!result.success) {
        throw new Error(result.error || "Fehler beim Laden der Benutzer");
      }
      return result.users || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleManualRefresh = () => {
    refetch();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
    setError(null);
    setSuccess(null);
  };

  const handleSaveEdit = async (userId: number) => {
    setUpdatingUser(userId);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateUser({
        userId,
        ...editForm,
      });

      if (result.success) {
        setSuccess(result.message || "Benutzer erfolgreich aktualisiert");
        setEditingUser(null);
        setEditForm({});
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      } else {
        setError(result.error || "Fehler beim Aktualisieren des Benutzers");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Fehler beim Aktualisieren des Benutzers");
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const isEnabled = !user.deactivated;
    setTogglingStatus(user.id);
    setError(null);
    setSuccess(null);

    try {
      const result = await toggleUserStatus({
        userId: user.id,
        enabled: isEnabled,
      });

      if (result.success) {
        setSuccess(result.message || "Status erfolgreich geändert");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      } else {
        setError(result.error || "Fehler beim Ändern des Status");
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError("Fehler beim Ändern des Status");
    } finally {
      setTogglingStatus(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-enex-primary mb-4" />
            <p className="text-gray-600">Benutzer werden geladen...</p>
          </div>
        </Card>
      </div>
    );
  }

  const users = usersData || [];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && !user.deactivated) ||
      (statusFilter === "disabled" && user.deactivated);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    enabled: users.filter((u) => !u.deactivated).length,
    disabled: users.filter((u) => u.deactivated).length,
    admins: users.filter((u) => u.role === "admin").length,
    regular: users.filter((u) => u.role === "user").length,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8" />
              Benutzerverwaltung
            </h1>
            <p className="text-gray-600 mt-1">Verwalten Sie alle Benutzer</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              Aktualisieren
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Buchungen
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline">Zurück zum Konto</Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Gesamt</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Aktiv</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.enabled}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Deaktiviert</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.disabled}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Administratoren</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.admins}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Benutzer</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.regular}
            </div>
          </Card>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nach E-Mail, Name oder Telefon suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Rolle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Benutzer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="enabled">Aktiv</SelectItem>
                <SelectItem value="disabled">Deaktiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Users List */}
        {queryError ? (
          <Card className="p-8">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                {queryError instanceof Error
                  ? queryError.message
                  : "Fehler beim Laden der Benutzer"}
              </p>
              <Button onClick={handleManualRefresh}>Erneut versuchen</Button>
            </div>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Keine Benutzer gefunden, die den Filterkriterien entsprechen."
                  : "Keine Benutzer gefunden."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6">
                {editingUser === user.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <Input
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-Mail
                        </label>
                        <Input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <Input
                          type="tel"
                          value={editForm.phone || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rolle
                        </label>
                        <Select
                          value={editForm.role || "user"}
                          onValueChange={(value) =>
                            setEditForm({
                              ...editForm,
                              role: value as "user" | "admin",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Benutzer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveEdit(user.id)}
                        disabled={updatingUser === user.id}
                        className="bg-enex-primary hover:bg-enex-hover text-white"
                      >
                        {updatingUser === user.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Speichern...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Speichern
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updatingUser === user.id}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {user.role === "admin" ? (
                            <Shield className="w-5 h-5 text-blue-600" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user.name || "Kein Name"}
                          </h3>
                          {user.deactivated && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Deaktiviert
                            </span>
                          )}
                          {user.role === "admin" && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">E-Mail:</span> {user.email}
                        </div>
                        {user.phone && (
                          <div>
                            <span className="font-medium">Telefon:</span> {user.phone}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Erstellt:</span>{" "}
                          {user.createdAt
                            ? format(new Date(user.createdAt), "PPP", { locale: de })
                            : "Unbekannt"}
                        </div>
                        {user.deactivated && (
                          <div>
                            <span className="font-medium">Status:</span>{" "}
                            Deaktiviert
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:min-w-[200px]">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant={user.deactivated ? "outline" : "destructive"}
                        onClick={() => handleToggleStatus(user)}
                        disabled={togglingStatus === user.id}
                        className="w-full"
                      >
                        {togglingStatus === user.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Wird geändert...
                          </>
                        ) : user.deactivated ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aktivieren
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Deaktivieren
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
