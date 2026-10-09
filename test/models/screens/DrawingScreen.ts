import { browser } from '@wdio/globals';
import { createHash } from 'node:crypto';
import type { ChainablePromiseElement } from 'webdriverio';
import { AuthenticatedScreen } from '../core/AuthenticatedScreen.js';
import { drawPath, type RelativePoint } from '../core/Gestures.js';
import { resolveLocator } from '../core/Locator.js';
import type { SideMenuItem } from '../widgets/SideMenuWidget.js';

export class DrawingScreen extends AuthenticatedScreen {
    public static readonly menuItem: SideMenuItem = 'DRAWING';

    public get screen(): ChainablePromiseElement {
        return this.element('~test-DRAWING-SCREEN');
    }

    /**
     * The canvas is the screen's WebView. Both platforms nest more WebView nodes for the
     * web document inside it, so the first (outer) match is taken. The blueprint's
     * `//android.widget.Image` does not appear on Android.
     */
    public get canvas(): ChainablePromiseElement {
        return this.screen.$(resolveLocator({
            android: 'android=new UiSelector().className("android.webkit.WebView").instance(0)',
            ios: '-ios class chain:**/XCUIElementTypeWebView[1]',
        }));
    }

    public get clearButton(): ChainablePromiseElement {
        return this.element('~test-CLEAR');
    }

    public get saveButton(): ChainablePromiseElement {
        return this.element('~test-SAVE');
    }

    protected get trait(): ChainablePromiseElement {
        return this.canvas;
    }

    public async draw(path: readonly RelativePoint[]): Promise<void> {
        await drawPath(this.canvas, path);
    }

    public async clear(): Promise<void> {
        await this.clearButton.click();
    }

    /**
     * SHA-256 of a canvas screenshot, taken once the canvas stops repainting.
     * Equal fingerprints mean identical pixels.
     */
    public async getCanvasFingerprint(): Promise<string> {
        let current = await this.captureCanvasHash();
        await browser.waitUntil(
            async () => {
                const previous = current;
                current = await this.captureCanvasHash();
                return current === previous;
            },
            { timeout: 5000, interval: 300, timeoutMsg: 'Canvas kept changing' },
        );
        return current;
    }

    private async captureCanvasHash(): Promise<string> {
        const png = await browser.takeElementScreenshot(await this.canvas.elementId);
        return createHash('sha256').update(png).digest('hex');
    }
}
