// stack-server.ts
import "server-only";

export async function getStackServerApp() {
  const { StackServerApp } = await import("@stackframe/stack");
  return new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
      signIn: "/auth/signin",
      signUp: "/auth/signup",
      emailVerification: "/handler/email-verification",
      afterSignIn: "/auth/verify-email",
      afterSignUp: "/auth/verify-email",
    }
  });
}
