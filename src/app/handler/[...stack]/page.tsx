import { StackHandler } from "@stackframe/stack";
import { getStackServerApp } from "@/stack-server";

export default async function Handler(props: unknown) {
  const stackServerApp = await getStackServerApp();
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}