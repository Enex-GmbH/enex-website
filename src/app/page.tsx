import Hero from "@/components/home-page/hero";
import Plans from "@/components/home-page/plans";

export default function Home() {
  return (
    <main className="flex flex-col gap-20 mt-10">
      <Hero />
      <Plans />
    </main>
  );
}
