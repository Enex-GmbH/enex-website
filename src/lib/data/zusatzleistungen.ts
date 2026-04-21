import type { AddOn } from "@/store/booking-store";

function addon(id: string, name: string, priceEur: number): AddOn {
  return {
    id,
    name,
    priceEur,
    durationMinutes: 0,
  };
}

export const ZUSATZLEISTUNGEN_TITLE = "Add-Ons (Zusatzleistungen)";

/** Optional wählbare Extras zum Paket, jeweils mit Aufpreis. */
export const ZUSATZLEISTUNGEN_INTRO = "Individuelle Zusatzleistungen";

export const ZUSATZLEISTUNGEN_FOOTNOTE =
  "Ergänzen Sie Ihr Paket ganz nach Ihren Bedürfnissen.";

export interface ZusatzleistungKatalogSektion {
  heading: string;
  addOns: AddOn[];
}

/** Preise laut Enex-Preisliste / Vorgabe 2026 (EUR). */
export const ZUSATZLEISTUNGEN_KATALOG: ZusatzleistungKatalogSektion[] = [
  {
    heading: "Innenraum",
    addOns: [
      addon("innen-lederpflege", "Lederpflege (mit Conditioner)", 30),
      addon(
        "innen-polsterreinigung",
        "Polsterreinigung (Nassreinigung / Shampoonierung)",
        50
      ),
      addon("innen-textilsitze", "Textilsitze tiefenreinigen", 50),
      addon("innen-ozon", "Ozonbehandlung (Geruchsbeseitigung)", 50),
      addon("innen-tierhaare", "Tierhaarentfernung", 50),
      addon("innen-desinfektion", "Innenraum-Desinfektion", 30),
    ],
  },
  {
    heading: "Außen / Lack",
    addOns: [
      addon("aussen-radkaesten", "Radkästen reinigen", 30),
      addon("aussen-lackkneten", "Lackkneten (Dekontamination)", 50),
      addon(
        "aussen-maschinenpolitur",
        "Maschinenpolitur (Schleifpolitur)",
        500
      ),
      addon("aussen-lackschutz", "Lackschutz auftragen", 100),
      addon("aussen-wachs-versiegelung", "Versiegelung (Wachs)", 100),
    ],
  },
  {
    heading: "Spezial & Detail",
    addOns: [
      addon("spezial-motorraum-reinigung", "Motorraumreinigung", 70),
      addon("spezial-motorraum-pflege", "Motorraum-Pflege & Versiegelung", 50),
      addon("spezial-scheinwerfer", "Scheinwerferaufbereitung", 100),
      addon(
        "spezial-kunststoff-aussen",
        "Kunststoffpflege außen (Stoßfänger, Zierleisten etc.)",
        40
      ),
      addon("spezial-chrom", "Chrompflege", 40),
      addon("spezial-auspuff", "Auspuffblenden polieren", 50),
      addon("spezial-glas", "Glasversiegelung", 50),
      addon(
        "spezial-cabrio",
        "Cabrioverdeckreinigung & Imprägnierung",
        100
      ),
      addon(
        "spezial-scheiben",
        "Scheibenversiegelung / Regenabweiser",
        50
      ),
    ],
  },
  {
    heading: "Innenraumschutz / Premiumarbeiten",
    addOns: [
      addon("premium-textil", "Textilversiegelung", 50),
      addon("premium-leder", "Leder-Versiegelung", 50),
      addon("premium-kunststoff", "Kunststoffversiegelung", 50),
      addon("premium-dachhimmel", "Dachhimmelreinigung", 100),
    ],
  },
  {
    heading: "Sonstiges / Service",
    addOns: [
      addon("service-hol-bring", "Hol- & Bringservice", 40),
      addon("service-lack-analyse", "Lackzustandsanalyse", 50),
      addon("service-batterie", "Batterietest", 50),
      addon("service-reifendruck", "Reifendruckkontrolle", 15),
    ],
  },
];

export const ALLE_ZUSATZLEISTUNGEN: AddOn[] =
  ZUSATZLEISTUNGEN_KATALOG.flatMap((s) => s.addOns);

export const ZUSATZLEISTUNGEN_BY_ID: Record<string, AddOn> =
  Object.fromEntries(ALLE_ZUSATZLEISTUNGEN.map((a) => [a.id, a]));
