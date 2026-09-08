import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import {
  getIdentifiedPurchaserId,
  getLastSignedInUserId,
  setIdentifiedPurchaserId,
  setLastSignedInUserId,
} from '@/services/auth-state';
import { setAuthState } from '@/services/observe-events';
import { identifyPurchaser } from '@/services/purchases';
import { resetSettingsResolved } from '@/services/sync-state';

/**
 * Renders nothing. Keeps the synchronous sign-in flag, RevenueCat's identity,
 * and the Observe auth attribute in step with Clerk.
 *
 * Only WRITES the flag on a confirmed signed-in user. A dummy Clerk client
 * (`isLoaded && !isSignedIn` after a SecureStore miss) used to clear it and
 * bounce a returning user to login. Explicit sign-out in `account.ts` is what
 * clears the flag.
 */
export function AuthBridge() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && userId) {
      const previous = getLastSignedInUserId();
      if (previous !== userId) resetSettingsResolved();
      setLastSignedInUserId(userId);
      setAuthState('signed-in');

      if (getIdentifiedPurchaserId() !== userId) {
        identifyPurchaser(userId)
          .then((customerInfo) => {
            if (customerInfo) setIdentifiedPurchaserId(userId);
          })
          .catch((error) => console.warn('[auth] identifyPurchaser failed', error));
      }
      return;
    }

    setAuthState(getLastSignedInUserId() ? 'signed-in' : 'signed-out');
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
