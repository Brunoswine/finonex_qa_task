import { browser, driver } from '@wdio/globals';
import { APP } from '../config/app.js';
import { env, type Credentials } from '../config/env.js';
import { Device } from '../models/core/Device.js';
import { LoginScreen } from '../models/screens/LoginScreen.js';
import type { ProductsScreen } from '../models/screens/ProductsScreen.js';

/** Device in portrait, whatever the previous test left behind. */
export async function portraitOrientation(): Promise<void> {
    // Set it unconditionally: on iOS getOrientation() reports the foreground app's UI, so a
    // portrait-locked app reads PORTRAIT while the device itself is still in landscape.
    await Device.setOrientation('PORTRAIT');
}

/** Restarted app on the login screen. */
export async function freshApp(): Promise<LoginScreen> {
    await portraitOrientation();
    // Appium protocol commands rather than `mobile: terminateApp`: they work on every Appium
    // version, including old ones a cloud may fall back to.
    const appId = driver.isIOS ? APP.ios.bundleId : APP.android.appPackage;
    await driver.terminateApp(appId);
    await bringToForeground(appId);
    return new LoginScreen().waitForLoaded();
}

/** Appium app state for "running in foreground". */
const RUNNING_IN_FOREGROUND = 4;

/**
 * Activate the app until it is really in front. A single activateApp can lose a race with
 * the app below it, e.g. a browser left behind by an earlier test that is still rotating.
 */
async function bringToForeground(appId: string): Promise<void> {
    await driver.activateApp(appId);
    await browser.waitUntil(
        async () => {
            if ((await driver.queryAppState(appId)) === RUNNING_IN_FOREGROUND) {
                return true;
            }
            await driver.activateApp(appId);
            return false;
        },
        { timeout: 20000, interval: 2000, timeoutMsg: `${appId} did not come to the foreground` },
    );
}

/** Fresh app, logged in, on the products screen. */
export async function loggedIn(user: Credentials = env.standardUser): Promise<ProductsScreen> {
    const loginScreen = await freshApp();
    return loginScreen.login(user);
}

/** Logged in, with cart and sorting cleared via the side menu's "Reset App State". */
export async function loggedInWithCleanState(user: Credentials = env.standardUser): Promise<ProductsScreen> {
    const productsScreen = await loggedIn(user);
    const sideMenu = await productsScreen.topMenu.openSideMenu();
    await sideMenu.resetAppState();
    return productsScreen.waitForLoaded();
}
