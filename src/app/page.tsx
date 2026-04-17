import { NavHeader } from "@/components/landing/nav-header";
import { Hero } from "@/components/landing/hero";
import { LiveDemoStrip } from "@/components/landing/live-demo-strip";
import { DocketStrip } from "@/components/landing/docket-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrialVsDeliberation } from "@/components/landing/trial-vs-deliberation";
import { JuryGrid } from "@/components/landing/jury-grid";
import { PettyVsReal } from "@/components/landing/petty-vs-real";
import { ShareMoments } from "@/components/landing/share-moments";
import { FAQSection } from "@/components/landing/faq-section";
import { FooterCTA } from "@/components/landing/footer-cta";

export default function Home() {
  return (
    <div className="dark relative flex min-h-dvh flex-col bg-background text-foreground">
      {/* global grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>\")",
        }}
      />
      <NavHeader />
      <main className="relative z-10 flex-1">
        <Hero />
        <LiveDemoStrip />
        <DocketStrip />
        <HowItWorks />
        <TrialVsDeliberation />
        <JuryGrid />
        <PettyVsReal />
        <ShareMoments />
        <FAQSection />
      </main>
      <FooterCTA />
    </div>
  );
}
