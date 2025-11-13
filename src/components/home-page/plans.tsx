import { Card } from "@/components/ui/card"
import { useTranslations } from "next-intl";

const Plans = () => {
  const t = useTranslations("HOME.plans");

  const plans = [
    {
      title: t("basicPlan.title"),
      description: t("basicPlan.description"),
      image: "/images/home/basic-plan.png",
    },
    {
      title: t("premiumPlan.title"),
      description: t("premiumPlan.description"),
      image: "/images/home/premium-plan.png",
    },
    {
      title: t("exclusivePlan.title"),
      description: t("exclusivePlan.description"),
      image: "/images/home/exclusive-plan.png",
    },
  ];

  return (
    <section>
      <div className="container mx-auto bg-accent rounded-4xl">
        <div className="p-20 flex flex-col gap-5">
          <div>
            <h2 className="text-4xl font-bold">{t("title")}</h2>
            <p className="text-lg text-gray-500">{t("description")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {
              plans.map((plan) => (
                <Card
                  key={plan.title}
                  className="bg-cover bg-center h-80 relative overflow-hidden rounded-2xl"
                  style={{
                    backgroundImage: `url(${plan.image})`,
                    backgroundSize: 'cover',
                  }}
                />
              ))
            }
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
