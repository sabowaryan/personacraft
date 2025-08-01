// stack-server.ts
import "server-only";
import "./lib/polyfills"; // Import des polyfills en premier
import { stackConfig } from "./stack";

export async function getStackServerApp() {
  
  const { StackServerApp } = await import("@stackframe/stack");
  return new StackServerApp({
    ...stackConfig,
    urls: {
      ...stackConfig.urls,
      emailVerification: "/handler/email-verification",
      afterSignUp: "/auth/verify-email",
    }
  });
}