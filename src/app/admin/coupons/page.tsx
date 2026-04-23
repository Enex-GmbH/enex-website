"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Ticket, Trash2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoupons, createCoupon, deleteCoupon } from "@/lib/actions";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminCouponRow } from "@/lib/actions/admin/getCoupons";

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [percentValue, setPercentValue] = useState("");
  const [fixedEur, setFixedEur] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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

  const {
    data: coupons = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const result = await getCoupons();
      if (!result.success) {
        throw new Error(result.error || "Fehler beim Laden");
      }
      return result.coupons || [];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setCreating(true);

    try {
      if (discountType === "percentage") {
        const n = parseInt(percentValue, 10);
        const result = await createCoupon({
          code,
          discountType: "percentage",
          discountValue: n,
        });
        if (!result.success) {
          setFormError(result.error || "Erstellung fehlgeschlagen");
          return;
        }
      } else {
        const n = parseFloat(fixedEur.replace(",", "."));
        const result = await createCoupon({
          code,
          discountType: "fixed",
          discountFixedEur: n,
        });
        if (!result.success) {
          setFormError(result.error || "Erstellung fehlgeschlagen");
          return;
        }
      }
      setFormSuccess("Gutschein erstellt.");
      setCode("");
      setPercentValue("");
      setFixedEur("");
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Gutschein wirklich löschen?")) return;
    setDeletingId(id);
    try {
      const result = await deleteCoupon({ id });
      if (!result.success) {
        alert(result.error || "Löschen fehlgeschlagen");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDiscount = (row: AdminCouponRow) => {
    if (row.discountType === "percentage") {
      return `${row.discountValue} %`;
    }
    if (row.discountType === "fixed") {
      return `${(row.discountValue / 100).toFixed(2)} €`;
    }
    return row.discountValue.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Ticket className="h-8 w-8 text-enex-primary" />
        <h1 className="text-2xl font-bold">Gutscheine</h1>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Neuen Gutschein anlegen</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Code (3–50 Zeichen, A–Z, 0–9, _ -)
            </label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="z.B. SAVE20"
              maxLength={50}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rabattart</label>
            <Select
              value={discountType}
              onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Prozent</SelectItem>
                <SelectItem value="fixed">Fester Betrag (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {discountType === "percentage" ? (
            <div>
              <label
                htmlFor="pct"
                className="block text-sm font-medium mb-1"
              >
                Rabatt (%)
              </label>
              <Input
                id="pct"
                type="number"
                min={1}
                max={100}
                step={1}
                value={percentValue}
                onChange={(e) => setPercentValue(e.target.value)}
                className="max-w-xs"
                required
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="eur"
                className="block text-sm font-medium mb-1"
              >
                Rabattbetrag (€)
              </label>
              <Input
                id="eur"
                type="number"
                min={0.01}
                step={0.01}
                value={fixedEur}
                onChange={(e) => setFixedEur(e.target.value)}
                className="max-w-xs"
                required
              />
            </div>
          )}
          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p className="text-sm text-green-700" role="status">
              {formSuccess}
            </p>
          )}
          <Button
            type="submit"
            disabled={creating}
            className="bg-enex-primary hover:bg-enex-hover text-white"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Wird gespeichert…
              </>
            ) : (
              "Gutschein erstellen"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Aktive Gutscheine</h2>
        {loading && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Lädt…
          </div>
        )}
        {queryError && (
          <p className="text-red-600 text-sm">
            {(queryError as Error).message}
          </p>
        )}
        {!loading && !queryError && coupons.length === 0 && (
          <p className="text-gray-600 text-sm">Noch keine Gutscheine.</p>
        )}
        {!loading && coupons.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Rabatt</th>
                  <th className="py-2 pr-4">Erstellt</th>
                  <th className="py-2 w-24" />
                </tr>
              </thead>
              <tbody>
                {coupons.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-mono font-medium">
                      {row.code}
                    </td>
                    <td className="py-3 pr-4">{formatDiscount(row)}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString("de-DE")
                        : "—"}
                    </td>
                    <td className="py-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                      >
                        {deletingId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
