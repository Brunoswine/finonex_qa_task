import { driver } from '@wdio/globals';

/** Selector per platform, for elements the two platforms expose differently. */
export interface PlatformLocator {
    android: string;
    ios: string;
}

/**
 * A plain string works on both platforms, e.g. an accessibility id (`~test-Menu`)
 * from a React Native testID. Use a PlatformLocator only where the trees differ.
 */
export type Locator = string | PlatformLocator;

/** Pick the selector for the platform of the current session. */
export const resolveLocator = (locator: Locator): string => {
    if (typeof locator === 'string') {
        return locator;
    }
    return driver.isIOS ? locator.ios : locator.android;
};
