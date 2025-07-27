'use client';

import { StackProvider, StackTheme } from "@stackframe/stack";
import { getStackClientApp } from "../stack-client";

interface StackProviderWrapperProps {
  children: React.ReactNode;
  customTheme: any;
}

export default function StackProviderWrapper({ children, customTheme }: StackProviderWrapperProps) {
  const stackApp = getStackClientApp();

  return (
    <StackProvider app={stackApp}>
      <StackTheme theme={customTheme}>
        {children}
      </StackTheme>
    </StackProvider>
  );
}