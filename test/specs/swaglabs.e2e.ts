import { expect } from '@wdio/globals';
import { loggedIn, loggedInWithCleanState } from '../fixtures/session.fixture.js';
import { Device } from '../pageobjects/core/Device.js';
import type { RelativePoint } from '../pageobjects/core/Gestures.js';
import { AboutScreen } from '../pageobjects/screens/AboutScreen.js';
import { DrawingScreen } from '../pageobjects/screens/DrawingScreen.js';
import { SortOption } from '../pageobjects/widgets/SortModalWidget.js';

const ZIGZAG: readonly RelativePoint[] = [
    { x: 0.2, y: 0.2 },
    { x: 0.8, y: 0.35 },
    { x: 0.2, y: 0.5 },
    { x: 0.8, y: 0.65 },
    { x: 0.2, y: 0.8 },
];

describe('Swag Labs', () => {
    afterEach(async () => {
        // Restore portrait even if a test failed mid-rotation, so later tests start clean.
        if ((await Device.getOrientation()) !== 'PORTRAIT') {
            await Device.setOrientation('PORTRAIT');
        }
    });

    it('sorts products by price, low to high', async () => {
        const productsScreen = await loggedInWithCleanState();

        await productsScreen.sortBy(SortOption.PriceLowToHigh);

        const products = await productsScreen.collectAllProducts();
        const prices = products.map(({ price }) => price);
        expect(products.length).toBeGreaterThan(1);
        expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('clears the drawing canvas', async () => {
        const productsScreen = await loggedInWithCleanState();
        const sideMenu = await productsScreen.topMenu.openSideMenu();
        const drawingScreen = await sideMenu.navigateTo(DrawingScreen);
        const blankCanvas = await drawingScreen.getCanvasFingerprint();

        await drawingScreen.draw(ZIGZAG);
        expect(await drawingScreen.getCanvasFingerprint()).not.toBe(blankCanvas);

        await drawingScreen.clear();
        expect(await drawingScreen.getCanvasFingerprint()).toBe(blankCanvas);
    });

    it('keeps the About page usable after rotating to landscape', async () => {
        const productsScreen = await loggedIn();
        const sideMenu = await productsScreen.topMenu.openSideMenu();
        const aboutScreen = await sideMenu.navigateTo(AboutScreen);

        expect(await aboutScreen.toolbar.getAddress()).toContain('saucelabs.com');
        const pageTitle = await aboutScreen.getPageTitle();
        expect(pageTitle).toContain('Sauce Labs');

        await Device.setOrientation('LANDSCAPE');

        expect(await Device.getOrientation()).toBe('LANDSCAPE');
        const window = await Device.getWindowSize();
        expect(window.width).toBeGreaterThan(window.height);

        await expect(aboutScreen.toolbar.addressBar).toBeDisplayed();
        await expect(aboutScreen.pageView).toBeDisplayed();
        expect(await aboutScreen.toolbar.getAddress()).toContain('saucelabs.com');
        expect(await aboutScreen.getPageTitle()).toBe(pageTitle);

        // Layout: the page re-flowed to landscape and fits on screen.
        const page = await aboutScreen.getPageViewRect();
        expect(page.width).toBeGreaterThan(page.height);
        expect(page.x + page.width).toBeLessThanOrEqual(window.width);
        expect(page.y + page.height).toBeLessThanOrEqual(window.height);
    });
});
