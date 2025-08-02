import ClientOnlyAuth from "@/components/ClientOnlyAuth";
import SignUpContent from "./SignUpContent";

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = 'force-dynamic';

export default function CustomSignUpPage() {
  return (
    <ClientOnlyAuth children={<SignUpContent />} />
  );
}

