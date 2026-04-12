import { HeroSection } from "@/components/homepage/hero-section";
import { AboutVedanticStudies } from "@/components/homepage/about-vedantic-studies";
import { AboutVedanta } from "@/components/homepage/about-vedanta";
import { AboutParampara } from "@/components/homepage/about-parampara";
import { ArshVidya } from "@/components/homepage/arsha-vidya";
import { AboutSwami } from "@/components/homepage/about-swami";
import { TeachersSection } from "@/components/homepage/teachers-section";
import { CtaBanner } from "@/components/homepage/cta-banner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutVedanticStudies />
      <AboutVedanta />
      <AboutParampara />
      <ArshVidya />
      <AboutSwami />
      <TeachersSection />
      <CtaBanner />
    </>
  );
}
