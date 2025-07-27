'use client';

import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter, usePathname } from 'next/navigation';

export function useOnboarding() {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ne pas rediriger si on est déjà sur la page d'onboarding
    if (user && !user.clientReadOnlyMetadata?.onboardedAt && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, router, pathname]);

  return {
    isOnboarded: user?.clientReadOnlyMetadata?.onboardedAt || false,
    userProfile: user?.clientReadOnlyMetadata || {},
  };
}

