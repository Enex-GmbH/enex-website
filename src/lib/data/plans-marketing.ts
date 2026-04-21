/**
 * Marketing copy for the home page plans section (German).
 * Plan keys align with booking `PlanPriceKey` where applicable.
 */

export type MarketingPlanKey = "basic" | "premium" | "exclusive";

export interface PlanMarketingSection {
  title: string;
  items: string[];
}

export interface PlanMarketing {
  key: MarketingPlanKey;
  title: string;
  subtitle: string;
  /** Optional intro callout (e.g. target audience) */
  callout?: string;
  sections: PlanMarketingSection[];
  /** Closing “Ideal / Perfekt” line */
  closing?: string;
  popular?: boolean;
  /** Stronger card shadow (featured) */
  featuredVisual?: boolean;
  isExclusive?: boolean;
  /** Meta row: duration */
  duration: string;
  /** Meta row: vehicle / audience */
  forLabel: string;
  /** Meta row: short “Ideal für” without duplicating closing */
  idealShort: string;
  /** Shown for basic & premium */
  priceLine?: string;
}

export const PLANS_MARKETING: PlanMarketing[] = [
  {
    key: "basic",
    title: "Basis Paket",
    subtitle: "Ideal für den Alltag und regelmäßige Pflege.",
    callout:
      "Für alle, die Wert auf Sauberkeit und Hygiene im Innenraum legen.",
    sections: [
      {
        title: "Innenraumreinigung",
        items: [
          "Fahrzeuginnenraum komplett saugen (Sitze, Teppiche, Kofferraum)",
          "Fußmatten reinigen",
          "Kofferraumreinigung inkl. Seitenverkleidungen",
          "Armaturenbrett & Mittelkonsole reinigen",
          "Türverkleidungen & Einstiege reinigen",
          "Ablagen & Lüftungsschlitze reinigen",
          "Fenster & Spiegel innen reinigen",
          "Cockpitpflege (matt oder glänzend)",
          "Kunststoffpflege innen",
        ],
      },
    ],
    duration: "Dauer: ~4 Stunden",
    forLabel: "Für: 1 Privatauto",
    idealShort: "Ideal für: regelmäßige Wartungsreinigung",
    priceLine:
      "€150 (Kleinwagen), €200 (Standardwagen), €250 (SUV) — Preisliste 2026",
  },
  {
    key: "premium",
    title: "Premium Paket",
    subtitle: "Für Kunden, die mehr als nur Sauberkeit wollen.",
    sections: [
      {
        title: "Innenraumreinigung",
        items: [
          "Fahrzeuginnenraum komplett saugen (Sitze, Teppiche, Kofferraum)",
          "Zwischenräume & Ritzen absaugen",
          "Fußmatten reinigen",
          "Kofferraumreinigung inkl. Seitenverkleidungen",
          "Armaturenbrett & Mittelkonsole reinigen",
          "Türverkleidungen & Einstiege reinigen",
          "Ablagen & Lüftungsschlitze reinigen",
          "Fenster & Spiegel innen reinigen",
          "Cockpitpflege (matt oder glänzend)",
          "Kunststoffpflege innen",
        ],
      },
      {
        title: "Außenreinigung",
        items: [
          "Handwäsche (pH-neutrales Shampoo)",
          "Außenspiegel & Fenster außen",
          "Trocknung mit Mikrofasertuch",
        ],
      },
    ],
    closing: "Perfekt für ein gepflegtes Gesamtbild innen und außen.",
    popular: true,
    featuredVisual: true,
    duration: "Dauer: ~4–5 Stunden",
    forLabel: "Für: 1 Auto",
    idealShort: "Ideal für: Innen- und Außenpflege in einem Paket",
    priceLine:
      "€280 (Kleinwagen), €330 (Standardwagen), €430 (SUV) — Preisliste 2026",
  },
  {
    key: "exclusive",
    title: "Exclusive Paket",
    subtitle: "Für höchste Ansprüche und maximale Ergebnisse.",
    sections: [
      {
        title: "Innenraumreinigung",
        items: [
          "Fahrzeuginnenraum komplett saugen (Sitze, Teppiche, Kofferraum)",
          "Zwischenräume & Ritzen absaugen",
          "Fußmatten reinigen",
          "Kofferraumreinigung inkl. Seitenverkleidungen",
          "Dachhimmelreinigung",
          "Armaturenbrett & Mittelkonsole reinigen",
          "Türverkleidungen & Einstiege reinigen",
          "Ablagen & Lüftungsschlitze reinigen",
          "Fenster & Spiegel innen reinigen",
          "Cockpitpflege (matt oder glänzend)",
          "Kunststoffpflege innen",
          "Pedale & Einstiegsleisten reinigen",
          "Sicherheitsgurte reinigen",
          "Lederreinigung (sanft)",
          "Duft einsetzen (Premium-Duft)",
        ],
      },
      {
        title: "Außenreinigung",
        items: [
          "Handwäsche (pH-neutrales Shampoo)",
          "Felgenreinigung (säurefrei)",
          "Reifenreinigung & Reifenpflege (Glanzmittel)",
          "Lack gründlich abspülen (Vorwäsche)",
          "Insektenentfernung",
          "Türfalze & Einstiege reinigen",
          "Tankdeckelbereich reinigen",
          "Außenspiegel & Fenster außen reinigen",
          "Wasserflecken entfernen",
          "Trocknung mit Mikrofasertuch",
          "Schnellwachs / Lackschutz-Spray auftragen",
        ],
      },
      {
        title: "Lackaufbereitung / Pflege",
        items: [
          "Lackreinigung (Teer-, Harz-, Flugrostentfernung)",
          "Hochglanzpolitur (2-stufig / 3-stufig)",
          "Versiegelung (Wachs, Polymer oder Nano)",
        ],
      },
      {
        title: "Spezial- & Detailarbeiten",
        items: ["Emblemreinigung"],
      },
    ],
    closing:
      "Für Kunden, die ihr Fahrzeug auf Showroom-Niveau bringen möchten.",
    isExclusive: true,
    duration: "Dauer: bis zu 8 Stunden oder nach Absprache",
    forLabel: "Für: höchste Ansprüche & Showroom-Ergebnis",
    idealShort: "Ideal für: maximale Aufbereitung innen und außen",
    priceLine:
      "€400 (Kleinwagen), €480 (Standardwagen), €580 (SUV) — Preisliste 2026",
  },
];
