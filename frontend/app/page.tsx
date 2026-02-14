import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingGate } from "@/components/landing/landing-gate";
import { LandingHeader } from "@/components/landing/landing-header";
import { Problem } from "@/components/landing/problem";

export default function Home() {
  return (
    <LandingGate>
      <main className="min-h-screen bg-[#FDFBF7]">
        <LandingHeader />
        <Hero />
        <Problem />
        <Features />
        <CTA />
        <LandingFooter />
      </main>
    </LandingGate>
  );
}

