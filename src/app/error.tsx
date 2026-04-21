"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Etwas ist schiefgelaufen</h1>
      <p className="max-w-md text-muted-foreground text-sm">
        Bitte versuchen Sie es erneut. Wenn das Problem bleibt, kontaktieren
        Sie uns.
      </p>
      <Button type="button" onClick={() => reset()}>
        Erneut versuchen
      </Button>
    </div>
  );
}
