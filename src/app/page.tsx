import { 
  HeroSection, 
  FeaturesSection, 
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
      <PricingSection />
      <TestimonialsSection />
      <ContactSection />
     
    </>
  );
}


