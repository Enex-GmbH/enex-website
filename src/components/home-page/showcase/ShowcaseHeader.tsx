export function ShowcaseHeader() {
  return (
    <div className="mx-auto max-w-2xl space-y-2 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground">
        Referenzen
      </p>
      <h2
        id="showcase-heading"
        className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
      >
        Unsere Ergebnisse
      </h2>
      <p className="text-sm text-muted-foreground md:text-base">
        Jedes Fahrzeug erhält die Aufmerksamkeit, die es verdient.
      </p>
    </div>
  );
}
