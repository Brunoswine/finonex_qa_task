import { $, browser, driver } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { BaseScreen } from '../core/BaseScreen.js';
import type { WaitOptions } from '../core/BaseWidget.js';
import { getRect, type Rect } from '../core/Gestures.js';
import { BrowserToolbarWidget } from '../widgets/BrowserToolbarWidget.js';
import type { SideMenuItem } from '../widgets/SideMenuWidget.js';

/**
 * External browser (the Android default, Safari on iOS) outside the app. The side menu's
 * "About" item opens the Sauce Labs website in it. Being another app, it extends
 * BaseScreen and has no top menu.
 */
export class BrowserScreen extends BaseScreen {
    /** The side menu item that opens this screen. */
    public static readonly menuItem: SideMenuItem = 'ABOUT';

    public readonly toolbar = new BrowserToolbarWidget();

    /** The area that renders the web page. */
    public get pageView(): ChainablePromiseElement {
        return this.element({
            android: 'android=new UiSelector().className("android.webkit.WebView")',
            // Safari nests unnamed WebViews inside this one.
            ios: '-ios predicate string:type == "XCUIElementTypeWebView" AND name == "WebView"',
        });
    }

    /** Backdrop of a Firefox bottom sheet, e.g. its translation offer on non-English devices. */
    private get sheetBackdrop(): ChainablePromiseElement {
        return $('android=new UiSelector().resourceIdMatches(".*:id/touch_outside")');
    }

    /** The page, not the toolbar: browsers may keep the toolbar collapsed from an earlier visit. */
    protected get trait(): ChainablePromiseElement {
        return this.pageView;
    }

    /**
     * Wait for the page, bring up the toolbar if the browser collapsed it, wait for an
     * address, then dismiss a browser bottom sheet if one pops up.
     */
    public override async waitForLoaded(options: WaitOptions = {}): Promise<this> {
        await super.waitForLoaded({ timeout: 20000, ...options });
        await this.toolbar.reveal();
        await browser.waitUntil(async () => (await this.toolbar.getAddress()) !== '', {
            timeout: 20000,
            timeoutMsg: 'Browser did not show an address',
        });
        if (!driver.isIOS) {
            await this.dismissBottomSheet();
        }
        return this;
    }

    public async getPageViewRect(): Promise<Rect> {
        return getRect(this.pageView);
    }

    private async dismissBottomSheet(): Promise<void> {
        const sheetShown = await this.sheetBackdrop.waitForExist({ timeout: 3000 }).catch(() => false);
        if (sheetShown) {
            await this.sheetBackdrop.click();
            await this.sheetBackdrop.waitForExist({ reverse: true });
        }
    }
}
