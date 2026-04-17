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
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
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
