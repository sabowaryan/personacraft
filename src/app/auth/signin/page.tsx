import ClientOnlyAuth from "@/components/ClientOnlyAuth";
import SignInContent from "./SignInContent";

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = 'force-dynamic';

export default function CustomSignInPage() {
  return (
    <ClientOnlyAuth children={<SignInContent />} />
  );
}

