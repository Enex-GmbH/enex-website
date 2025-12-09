"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  Lock,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "@/lib/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/auth-schemas";
import type {
  UpdateProfileFormData,
  ChangePasswordFormData,
} from "@/lib/validations/auth-schemas";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    name: string | null;
    email: string;
    phone: string | null;
  } | null>(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Delete account form
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    loadUserProfile();
  }, [session, status, router]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserProfile();
      if (result.success && result.user) {
        setUserData({
          name: result.user.name || "",
          email: result.user.email,
          phone: result.user.phone || "",
        });
        resetProfile({
          name: result.user.name || "",
          email: result.user.email,
          phone: result.user.phone || "",
        });
      } else {
        setError(result.error || "Fehler beim Laden des Profils");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Fehler beim Laden des Profils");
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data: UpdateProfileFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        setSuccess(result.message || "Profil erfolgreich aktualisiert");
        await loadUserProfile();
      } else {
        setError(result.error || "Fehler beim Aktualisieren des Profils");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Fehler beim Aktualisieren des Profils");
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await changePassword(data);
      if (result.success) {
        setSuccess(result.message || "Passwort erfolgreich geändert");
        resetPassword();
      } else {
        setError(result.error || "Fehler beim Ändern des Passworts");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Fehler beim Ändern des Passworts");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("Bitte geben Sie Ihr Passwort ein");
      return;
    }

    const confirmed = window.confirm(
      "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteAccount({ password: deletePassword });
      if (result.success) {
        setSuccess(result.message || "Konto erfolgreich gelöscht");
        // Sign out and redirect after a short delay
        setTimeout(() => {
          signOut({ callbackUrl: "/" });
        }, 2000);
      } else {
        setError(result.error || "Fehler beim Löschen des Kontos");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Fehler beim Löschen des Kontos");
      setIsDeleting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-enex-primary mb-4" />
            <p className="text-gray-600">Profil wird geladen...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!session || !userData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil</h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre persönlichen Informationen und Kontoeinstellungen
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* 1. Personal Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Persönliche Informationen
            </h2>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  {...registerProfile("name")}
                  className={profileErrors.name ? "border-red-500" : ""}
                  placeholder="Ihr Name"
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-Mail-Adresse
                </label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile("email")}
                  className={profileErrors.email ? "border-red-500" : ""}
                  placeholder="ihre.email@example.com"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefonnummer (optional)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  {...registerProfile("phone")}
                  className={profileErrors.phone ? "border-red-500" : ""}
                  placeholder="+49 123 456789"
                />
                {profileErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="bg-enex-primary hover:bg-enex-hover text-white"
              >
                Änderungen speichern
              </Button>
            </form>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* 2. Account Settings */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Kontoeinstellungen
            </h2>

            {/* Change Password */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Passwort ändern
              </h3>
              <form
                onSubmit={handleSubmitPassword(onPasswordSubmit)}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Aktuelles Passwort
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword("currentPassword")}
                    className={
                      passwordErrors.currentPassword ? "border-red-500" : ""
                    }
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Neues Passwort
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerPassword("newPassword")}
                    className={
                      passwordErrors.newPassword ? "border-red-500" : ""
                    }
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Neues Passwort bestätigen
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword("confirmPassword")}
                    className={
                      passwordErrors.confirmPassword ? "border-red-500" : ""
                    }
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="bg-enex-primary hover:bg-enex-hover text-white"
                >
                  Passwort ändern
                </Button>
              </form>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* 5. Danger Zone */}
          <section>
            <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Gefahrenzone
            </h2>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Konto löschen
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Wenn Sie Ihr Konto löschen, werden alle Ihre Daten anonymisiert
                und Sie können sich nicht mehr anmelden. Diese Aktion kann nicht
                rückgängig gemacht werden.
              </p>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="deletePassword"
                    className="block text-sm font-medium text-red-900 mb-1"
                  >
                    Passwort zur Bestätigung
                  </label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Ihr Passwort"
                    className="max-w-md"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird gelöscht...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Konto dauerhaft löschen
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}
