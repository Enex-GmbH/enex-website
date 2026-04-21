"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const router = useRouter();

  const handleStartBooking = () => {
    router.push("/booking/location");
  };

  return (
    <section className="mb-20">
      <div className="container mx-auto">
        <div
          className="rounded-3xl p-8 md:p-16 text-center text-white"
          style={{
            background: `linear-gradient(to right, var(--enex-primary), var(--enex-hover))`,
          }}
        >
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Bereit für ein sauberes Auto?
            </h2>
            <p className="text-lg md:text-xl text-white/90">
              Starten Sie jetzt Ihre Buchung und erleben Sie professionelle
              Autopflege direkt bei Ihnen vor Ort.
            </p>
            <div className="mt-4">
              <Button
                onClick={handleStartBooking}
                size="lg"
                className="bg-white text-enex-primary hover:bg-gray-100 font-semibold text-lg px-8 py-6 h-auto rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Jetzt buchen
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
