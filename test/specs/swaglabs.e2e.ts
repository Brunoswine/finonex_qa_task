import { expect } from '@wdio/globals';
import { loggedIn, loggedInWithCleanState } from '../fixtures/session.fixture.js';
import { Device } from '../models/core/Device.js';
import type { RelativePoint } from '../models/core/Gestures.js';
import { AboutScreen } from '../models/screens/AboutScreen.js';
import { DrawingScreen } from '../models/screens/DrawingScreen.js';
import { SortOption } from '../models/widgets/SortModalWidget.js';

// The "Cool S" in one stroke. The bottom-middle line is drawn back over (Md -> Mc -> Q) to reach the lower-left part.
const COOL_S: readonly RelativePoint[] = [
    { x: 0.5, y: 0.25 }, // top-middle line
    { x: 0.5, y: 0.45 },
    { x: 0.65, y: 0.5 }, // P: where the diagonals cross on the right
    { x: 0.8, y: 0.45 },
    { x: 0.8, y: 0.25 }, // top-right line
    { x: 0.5, y: 0.1 }, // top tip
    { x: 0.2, y: 0.25 },
    { x: 0.2, y: 0.45 }, // top-left line
    { x: 0.35, y: 0.5 }, // Q: where the diagonals cross on the left
    { x: 0.5, y: 0.55 }, // Mc
    { x: 0.5, y: 0.75 }, // Md: bottom-middle line
    { x: 0.5, y: 0.55 }, // back over Mc...
    { x: 0.35, y: 0.5 }, // ...to Q
    { x: 0.2, y: 0.55 },
    { x: 0.2, y: 0.75 }, // bottom-left line
    { x: 0.5, y: 0.9 }, // bottom tip
    { x: 0.8, y: 0.75 },
    { x: 0.8, y: 0.55 }, // bottom-right line
    { x: 0.65, y: 0.5 }, // back to P
];

describe('Swag Labs', () => {
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

        await drawingScreen.draw(COOL_S);
        expect(await drawingScreen.getCanvasFingerprint()).not.toBe(blankCanvas);

        await drawingScreen.clear();
        expect(await drawingScreen.getCanvasFingerprint()).toBe(blankCanvas);
    });

    it('keeps the About page usable after rotating to landscape', async () => {
        const productsScreen = await loggedIn();
        const sideMenu = await productsScreen.topMenu.openSideMenu();
        const aboutScreen = await sideMenu.navigateTo(AboutScreen);

        await expect(aboutScreen.pageView).toBeDisplayed();
        expect(await aboutScreen.toolbar.getAddress()).toContain('saucelabs.com');

        await Device.setOrientation('LANDSCAPE');

        expect(await Device.getOrientation()).toBe('LANDSCAPE');
        const window = await Device.getWindowSize();
        expect(window.width).toBeGreaterThan(window.height);

        // Safari on compact iPhones hides its toolbar in landscape; usable means a tap brings it back.
        await aboutScreen.toolbar.reveal();
        await expect(aboutScreen.toolbar.addressBar).toBeDisplayed();
        await expect(aboutScreen.pageView).toBeDisplayed();
        expect(await aboutScreen.toolbar.getAddress()).toContain('saucelabs.com');

        // Layout: the page re-flowed to landscape and fits on screen.
        const page = await aboutScreen.getPageViewRect();
        expect(page.width).toBeGreaterThan(page.height);
        expect(page.x + page.width).toBeLessThanOrEqual(window.width);
        expect(page.y + page.height).toBeLessThanOrEqual(window.height);
    });
});
