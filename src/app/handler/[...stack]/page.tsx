import { StackHandler } from "@stackframe/stack";
import { getStackServerApp } from "../../../stack";

export default async function Handler(props: unknown) {
  const app = await getStackServerApp();
  return <StackHandler fullPage app={app} routeProps={props} />;
}
