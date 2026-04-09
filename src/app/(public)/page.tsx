import { HeroSection } from "@/components/homepage/hero-section";
import { AboutVedanta } from "@/components/homepage/about-vedanta";
import { AboutVedanticStudies } from "@/components/homepage/about-vedantic-studies";
import { AboutParampara } from "@/components/homepage/about-parampara";
import { AboutSwami } from "@/components/homepage/about-swami";
import { TeachersSection } from "@/components/homepage/teachers-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutVedanta />
      <AboutVedanticStudies />
      <AboutParampara />
      <AboutSwami />
      <TeachersSection />
    </>
  );
}
