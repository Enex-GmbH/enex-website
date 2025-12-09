"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginFormData,
} from "@/lib/validations/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { checkUserStatus } from "@/lib/actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user was logged out due to deactivation
  useEffect(() => {
    const deactivated = searchParams.get("deactivated");
    if (deactivated === "true") {
      setError(
        "Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie den Administrator für weitere Informationen."
      );
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // First check if user exists and is deactivated
      const statusCheck = await checkUserStatus(data.email);
      
      if (statusCheck.exists && statusCheck.isDeactivated) {
        setError(
          "Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie den Administrator für weitere Informationen."
        );
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ungültige E-Mail-Adresse oder Passwort");
        setIsLoading(false);
        return;
      }

      // Redirect to account page on success
      router.push("/account");
      router.refresh();
    } catch (err) {
      // Check if error is due to account deactivation
      if (err instanceof Error && err.message === "ACCOUNT_DEACTIVATED") {
        setError(
          "Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie uns für weitere Informationen."
        );
      } else {
        setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Anmelden</h1>
        <p className="text-gray-600 mb-6">Melden Sie sich mit Ihrem Konto an</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Passwort
            </label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Passwort vergessen?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-enex-primary hover:bg-enex-hover text-white"
            disabled={isLoading}
          >
            {isLoading ? "Wird angemeldet..." : "Anmelden"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Noch kein Konto?{" "}
            <Link
              href="/register"
              className="text-enex-primary hover:text-enex-hover font-medium"
            >
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
