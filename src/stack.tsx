// Configuration partagée pour Stack Auth
export const stackConfig = {
  tokenStore: "nextjs-cookie" as const,
  urls: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    
  }
};






