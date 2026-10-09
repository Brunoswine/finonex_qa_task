import { driver } from '@wdio/globals';
import { APP } from '../config/app.js';
import { env, type Credentials } from '../config/env.js';
import { Device } from '../models/core/Device.js';
import { LoginScreen } from '../models/screens/LoginScreen.js';
import type { ProductsScreen } from '../models/screens/ProductsScreen.js';


export async function portraitOrientation(): Promise<void> {
    // Set it unconditionally: on iOS getOrientation() reports the foreground app's UI, so a
    // portrait-locked app reads PORTRAIT while the device itself is still in landscape.
    await Device.setOrientation('PORTRAIT');
}

export async function freshApp(): Promise<LoginScreen> {
    await portraitOrientation();
    // Appium protocol commands rather than `mobile: terminateApp`: they work on every Appium
    // version, including old ones a cloud may fall back to.
    const appId = driver.isIOS ? APP.ios.bundleId : APP.android.appPackage;
    await driver.terminateApp(appId);
    await driver.activateApp(appId);
    return new LoginScreen().waitForLoaded();
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
