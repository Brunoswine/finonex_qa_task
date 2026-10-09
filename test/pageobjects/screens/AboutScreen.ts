import { $, browser } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { BaseScreen } from '../core/BaseScreen.js';
import type { WaitOptions } from '../core/BaseWidget.js';
import { getRect, type Rect } from '../core/Gestures.js';
import { BrowserToolbarWidget } from '../widgets/BrowserToolbarWidget.js';
import type { SideMenuItem } from '../widgets/SideMenuWidget.js';

/**
 * "About" opens the Sauce Labs website in the device's default browser, outside the
 * app. That is why this screen extends BaseScreen and has no top menu.
 */
export class AboutScreen extends BaseScreen {
    public static readonly menuItem: SideMenuItem = 'ABOUT';

    public readonly toolbar = new BrowserToolbarWidget();

    /** The web page itself. Its text is the document title. */
    public get pageView(): ChainablePromiseElement {
        return this.element('android=new UiSelector().className("android.webkit.WebView")');
    }

    /** Backdrop of a browser bottom sheet, e.g. Firefox's translation offer on non-English devices. */
    private get sheetBackdrop(): ChainablePromiseElement {
        return $('android=new UiSelector().resourceIdMatches(".*:id/touch_outside")');
    }

    protected get trait(): ChainablePromiseElement {
        return this.toolbar.addressBar;
    }

    /** Wait for the page title, then dismiss a browser bottom sheet if one pops up over the page. */
    public override async waitForLoaded(options: WaitOptions = {}): Promise<this> {
        await super.waitForLoaded({ timeout: 20000, ...options });
        await browser.waitUntil(async () => (await this.getPageTitle()) !== '', {
            timeout: 20000,
            timeoutMsg: 'Web page did not load',
        });
        const sheetShown = await this.sheetBackdrop.waitForExist({ timeout: 3000 }).catch(() => false);
        if (sheetShown) {
            await this.sheetBackdrop.click();
            await this.sheetBackdrop.waitForExist({ reverse: true });
        }
        return this;
    }

    public async getPageTitle(): Promise<string> {
        return this.pageView.getText();
    }

    public async getPageViewRect(): Promise<Rect> {
        return getRect(this.pageView);
    }
}
