import ClientOnlyAuth from "@/components/ClientOnlyAuth";
import OnboardingContent from "./OnboardingContent";

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  return (
    <ClientOnlyAuth children={<OnboardingContent />} />
  );
}

