import { driver } from '@wdio/globals';
import { APP_ID } from '../config/app.js';
import { env, type Credentials } from '../config/env.js';
import { LoginScreen } from '../pageobjects/screens/LoginScreen.js';
import type { ProductsScreen } from '../pageobjects/screens/ProductsScreen.js';

/*
 * Pytest-style fixtures: plain async functions that bring the app into a known state
 * and return the screen to start from. Larger fixtures build on smaller ones, the way
 * pytest fixtures request other fixtures. Call them from a test or a beforeEach hook.
 */

/** Cold-start the app (also brings it back from an external browser) on the login screen. */
export async function freshApp(): Promise<LoginScreen> {
    await driver.execute('mobile: terminateApp', { appId: APP_ID });
    await driver.execute('mobile: activateApp', { appId: APP_ID });
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
