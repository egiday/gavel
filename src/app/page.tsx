import { NavHeader } from "@/components/landing/nav-header";
import { Hero } from "@/components/landing/hero";
import { LiveDemoStrip } from "@/components/landing/live-demo-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { JuryMarquee } from "@/components/landing/jury-marquee";
import { PettyVsReal } from "@/components/landing/petty-vs-real";
import { ShareMoments } from "@/components/landing/share-moments";
import { FAQSection } from "@/components/landing/faq-section";
import { FooterCTA } from "@/components/landing/footer-cta";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <NavHeader />
      <main className="flex-1">
        <Hero />
        <LiveDemoStrip />
        <HowItWorks />
        <JuryMarquee />
        <PettyVsReal />
        <ShareMoments />
        <FAQSection />
      </main>
      <FooterCTA />
    </div>
  );
}
