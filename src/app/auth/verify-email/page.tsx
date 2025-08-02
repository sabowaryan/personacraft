import ClientOnlyAuth from "@/components/ClientOnlyAuth";
import VerifyEmailContent from "./VerifyEmailContent";

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  return (
    <ClientOnlyAuth children={<VerifyEmailContent />} />
  );
}
