import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, Car, Euro, Sparkles, Building2, TruckIcon } from "lucide-react";

const Plans = () => {
  const t = useTranslations("HOME.plans");

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
            <h2 className="text-4xl font-bold">{t("title")}</h2>
            <p className="text-lg text-gray-500">{t("description")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {
              plans.map((plan) => (
                <div key={plan.key} className="flex flex-col gap-4 h-full">
                  {/* Card Image */}
                  <Card
                    className="bg-cover bg-center h-80 relative overflow-hidden rounded-2xl flex-shrink-0"
                    style={{
                      backgroundImage: `url(${plan.image})`,
                      backgroundSize: 'cover',
                    }}
                  />

                  {/* Plan Details */}
                  <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm flex-grow">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{t(`${plan.key}.title`)}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t(`${plan.key}.description`)}</p>
                    </div>

                    {/* Features */}
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: plan.featuresCount }).map((_, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{t(`${plan.key}.features.feature${idx + 1}`)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Duration, For, Price, Ideal */}
                    <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-enex-primary" />
                        <span className="text-sm text-gray-700">{t(`${plan.key}.duration`)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.isExclusive ? (
                          <TruckIcon className="h-4 w-4 text-enex-primary" />
                        ) : (
                          <Car className="h-4 w-4 text-enex-primary" />
                        )}
                        <span className="text-sm text-gray-700">{t(`${plan.key}.for`)}</span>
                      </div>

                      {!plan.isExclusive && (
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-enex-primary" />
                          <span className="text-sm font-semibold text-gray-900">{t(`${plan.key}.price`)}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-enex-primary" />
                        <span className="text-sm text-gray-700">{t(`${plan.key}.ideal`)}</span>
                      </div>
                    </div>

                    {/* CTA for Exclusive Plan */}
                    {plan.isExclusive && (
                      <Button className="mt-3 w-full bg-enex-primary hover:bg-enex-hover text-white">
                        <Building2 className="h-4 w-4 mr-2" />
                        {t(`${plan.key}.cta`)}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
