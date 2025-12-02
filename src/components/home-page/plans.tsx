import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Car,
  Euro,
  Sparkles,
  Building2,
  TruckIcon,
} from "lucide-react";

const Plans = () => {
  const plans = [
    {
      key: "basicPlan",
      image: "/images/home/basic-plan.png",
      featuresCount: 3,
      isExclusive: false,
    },
    {
      key: "premiumPlan",
      image: "/images/home/premium-plan.png",
      featuresCount: 4,
      isExclusive: false,
    },
    {
      key: "exclusivePlan",
      image: "/images/home/exclusive-plan.png",
      featuresCount: 4,
      isExclusive: true,
    },
  ];

  return (
    <section>
      <div className="container mx-auto bg-accent rounded-4xl">
        <div className="p-8 md:p-20 flex flex-col gap-5">
          <div>
            <h2 className="text-4xl font-bold">Ihr Auto. Unser Service.</h2>
            <p className="text-lg text-gray-500">
              Wir bringen die Fahrzeugpflege zu Ihnen – schnell, flexibel,
              professionell.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.key} className="flex flex-col gap-4 h-full">
                {/* Card Image */}
                <Card
                  className="bg-cover bg-center h-80 relative overflow-hidden rounded-2xl flex-shrink-0"
                  style={{
                    backgroundImage: `url(${plan.image})`,
                    backgroundSize: "cover",
                  }}
                />

                {/* Plan Details */}
                <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm flex-grow">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.key === "basicPlan" && "Basis-Paket"}
                      {plan.key === "premiumPlan" && "Premium-Paket"}
                      {plan.key === "exclusivePlan" && "Exklusiv-Paket"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.key === "basicPlan" &&
                        "Schnelle persönliche Wäsche für Einzelpersonen"}
                      {plan.key === "premiumPlan" &&
                        "Tiefenreinigung & Detailing für Einzelpersonen"}
                      {plan.key === "exclusivePlan" &&
                        "Für Unternehmen mit mehreren Fahrzeugen konzipiert"}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex flex-col gap-2">
                    {plan.key === "basicPlan" && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Außenhandwäsche
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Innenraumsaugen & Fenster
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Reifen- & Felgenreinigung
                          </span>
                        </div>
                      </>
                    )}
                    {plan.key === "premiumPlan" && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Alles aus dem Basis-Paket
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Wachs- & Polierfinish
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Innenraum-Tiefenreinigung (Armaturenbrett, Konsole,
                            Sitze)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Reifenglanz + Fensterversiegelung
                          </span>
                        </div>
                      </>
                    )}
                    {plan.key === "exclusivePlan" && (
                      <>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Professionelles Detailing für mehrere
                            Firmenfahrzeuge
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Flottenmanagement-Terminplanung
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Prioritärer Support & flexible Zeitfenster
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Individuelle Preisgestaltung pro Fahrzeug / Paket
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Duration, For, Price, Ideal */}
                  <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-enex-primary" />
                      <span className="text-sm text-gray-700">
                        {plan.key === "basicPlan" && "Dauer: ~4 Stunden"}
                        {plan.key === "premiumPlan" && "Dauer: ~4 Stunden"}
                        {plan.key === "exclusivePlan" &&
                          "Dauer: bis zu 8 Stunden oder Ganztagesservice"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {plan.isExclusive ? (
                        <TruckIcon className="h-4 w-4 text-enex-primary" />
                      ) : (
                        <Car className="h-4 w-4 text-enex-primary" />
                      )}
                      <span className="text-sm text-gray-700">
                        {plan.key === "basicPlan" && "Für: 1 Privatauto"}
                        {plan.key === "premiumPlan" && "Für: 1 Auto"}
                        {plan.key === "exclusivePlan" &&
                          "Für: Unternehmen & Organisationen"}
                      </span>
                    </div>

                    {!plan.isExclusive && (
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-enex-primary" />
                        <span className="text-sm font-semibold text-gray-900">
                          {plan.key === "basicPlan" && "Ab €60 (Kleinwagen)"}
                          {plan.key === "premiumPlan" &&
                            "Ab €90 (Mittelklassewagen)"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-enex-primary" />
                      <span className="text-sm text-gray-700">
                        {plan.key === "basicPlan" &&
                          "Ideal für: regelmäßige Wartungsreinigung"}
                        {plan.key === "premiumPlan" &&
                          "Ideal für: vierteljährliche Tiefenreinigung"}
                        {plan.key === "exclusivePlan" &&
                          "Ideal für: Fuhrparkmanagement & Firmenwagen"}
                      </span>
                    </div>
                  </div>

                  {/* CTA for Exclusive Plan */}
                  {plan.isExclusive && (
                    <Button className="mt-3 w-full bg-enex-primary hover:bg-enex-hover text-white">
                      <Building2 className="h-4 w-4 mr-2" />
                      Corporate-Angebot anfordern
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
