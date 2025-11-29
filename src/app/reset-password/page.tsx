"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "@/lib/validations/auth-schemas";
import { updatePassword } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (token) {
            setValue("token", token);
        }
    }, [token, setValue]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updatePassword(data);

            if (!result.success) {
                setError(result.error || "Fehler beim Zurücksetzen des Passworts");
                setIsLoading(false);
                return;
            }

            setSuccess(true);
            setIsLoading(false);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Ungültiger Link
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Der Reset-Link ist ungültig oder fehlt. Bitte fordern Sie einen
                        neuen Link an.
                    </p>
                    <Link href="/forgot-password">
                        <Button className="w-full bg-enex-primary hover:bg-enex-hover text-white">
                            Neuen Link anfordern
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Passwort zurückgesetzt
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Ihr Passwort wurde erfolgreich zurückgesetzt. Sie werden zur
                        Anmeldeseite weitergeleitet.
                    </p>
                    <Link href="/login">
                        <Button className="w-full bg-enex-primary hover:bg-enex-hover text-white">
                            Zur Anmeldung
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Neues Passwort festlegen
                </h1>
                <p className="text-gray-600 mb-6">
                    Geben Sie Ihr neues Passwort ein.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register("token")} />

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Neues Passwort
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
                        <p className="mt-1 text-xs text-gray-500">
                            Mindestens 8 Zeichen
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-enex-primary hover:bg-enex-hover text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? "Wird zurückgesetzt..." : "Passwort zurücksetzen"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-enex-primary hover:text-enex-hover font-medium"
                    >
                        Zurück zur Anmeldung
                    </Link>
                </div>
            </Card>
        </div>
    );
}

