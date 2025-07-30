import { 
  HeroSection, 
  FeaturesSection, 
  ContextSection,
  PricingSection, 
  TestimonialsSection, 
  ContactSection 
} from "@/components/home";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ContextSection />
      <PricingSection />
      <TestimonialsSection />
      <ContactSection />
     
    </>
  );
}


