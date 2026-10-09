import { expect } from '@wdio/globals';
import { loggedIn, loggedInWithCleanState } from '../fixtures/session.fixture.js';
import { Device } from '../models/core/Device.js';
import type { RelativePoint } from '../models/core/Gestures.js';
import { BrowserScreen } from '../models/screens/BrowserScreen.js';
import { DrawingScreen } from '../models/screens/DrawingScreen.js';
import { SortOption } from '../models/widgets/SortModalWidget.js';
import { attachScreenshot, step } from '../reporting/allure.js';

// The "Cool S" doodle in one continuous stroke, as fractions of the canvas size.
const COOL_S: readonly RelativePoint[] = [
    { x: 0.5, y: 0.25 },
    { x: 0.5, y: 0.45 },
    { x: 0.65, y: 0.5 },
    { x: 0.8, y: 0.45 },
    { x: 0.8, y: 0.25 },
    { x: 0.5, y: 0.1 },
    { x: 0.2, y: 0.25 },
    { x: 0.2, y: 0.45 },
    { x: 0.35, y: 0.5 },
    { x: 0.5, y: 0.55 },
    { x: 0.5, y: 0.75 },
    { x: 0.5, y: 0.55 },
    { x: 0.35, y: 0.5 },
    { x: 0.2, y: 0.55 },
    { x: 0.2, y: 0.75 },
    { x: 0.5, y: 0.9 },
    { x: 0.8, y: 0.75 },
    { x: 0.8, y: 0.55 },
    { x: 0.65, y: 0.5 },
];

describe('Finonex Test Task', () => {
    it('sorts products by price, low to high', async () => {
        const productsScreen = await step('Log in with a clean app state', () => loggedInWithCleanState());
        await attachScreenshot('Before sorting');

        await step('Sort by price, low to high', () => productsScreen.sortBy(SortOption.PriceLowToHigh));
        await attachScreenshot('After sorting');

        const products = await step('Read every product from the list', () => productsScreen.collectAllProducts());
        const prices = products.map(({ price }) => price);
        expect(products.length).toBeGreaterThan(1);
        expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('clears the drawing canvas', async () => {
        const drawingScreen = await step('Open the Drawing screen', async () => {
            const productsScreen = await loggedInWithCleanState();
            const sideMenu = await productsScreen.topMenu.openSideMenu();
            return sideMenu.navigateTo(DrawingScreen);
        });
        const blankCanvas = await drawingScreen.getCanvasFingerprint();
        await attachScreenshot('Before drawing');

        await step('Draw on the canvas', () => drawingScreen.draw(COOL_S));
        await attachScreenshot('After drawing');
        expect(await drawingScreen.getCanvasFingerprint()).not.toBe(blankCanvas);

        await step('Clear the canvas', () => drawingScreen.clear());
        await attachScreenshot('After clearing');
        expect(await drawingScreen.getCanvasFingerprint()).toBe(blankCanvas);
    });

    it('keeps the browser opened from About usable after rotating to landscape', async () => {
        const browserScreen = await step('Open About in the browser', async () => {
            const productsScreen = await loggedIn();
            const sideMenu = await productsScreen.topMenu.openSideMenu();
            return sideMenu.navigateTo(BrowserScreen);
        });

        await expect(browserScreen.pageView).toBeDisplayed();
        expect(await browserScreen.toolbar.getAddress()).toContain('saucelabs.com');
        await attachScreenshot('Before rotation');

        await step('Rotate to landscape', () => Device.setOrientation('LANDSCAPE'));
        await attachScreenshot('After rotation');

        expect(await Device.getOrientation()).toBe('LANDSCAPE');
        const window = await Device.getWindowSize();
        expect(window.width).toBeGreaterThan(window.height);

        // Safari on compact iPhones hides its toolbar in landscape; usable means a tap brings it back.
        await browserScreen.toolbar.reveal();
        await expect(browserScreen.toolbar.addressBar).toBeDisplayed();
        await expect(browserScreen.pageView).toBeDisplayed();
        expect(await browserScreen.toolbar.getAddress()).toContain('saucelabs.com');

        // Layout: the page re-flowed to landscape and fits on screen.
        const page = await browserScreen.getPageViewRect();
        expect(page.width).toBeGreaterThan(page.height);
        expect(page.x + page.width).toBeLessThanOrEqual(window.width);
        expect(page.y + page.height).toBeLessThanOrEqual(window.height);
    });
});
