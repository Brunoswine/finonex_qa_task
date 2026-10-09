import { driver } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { BaseWidget } from '../core/BaseWidget.js';
import { Device } from '../core/Device.js';
import { tap } from '../core/Gestures.js';

/**
 * Address bar of the external browser the app hands links to. On Android that is the
 * device default, so the locator matches the known ones: Firefox (`ADDRESSBAR_URL_BOX`
 * test tag) and Chrome (`url_bar`). On iOS it is Safari.
 */
export class BrowserToolbarWidget extends BaseWidget {
    public get addressBar(): ChainablePromiseElement {
        return this.element({
            android: 'android=new UiSelector().resourceIdMatches("ADDRESSBAR_URL_BOX|com.android.chrome:id/url_bar")',
            // Safari: a text field in portrait, the selected tab's button in landscape.
            ios: '-ios predicate string:(type == "XCUIElementTypeTextField" AND name == "TabBarItemTitle")'
                + ' OR (type == "XCUIElementTypeButton" AND name BEGINSWITH "UnifiedTabBarItemView" AND name CONTAINS "isSelected=true")',
        });
    }

    protected get trait(): ChainablePromiseElement {
        return this.addressBar;
    }

    /**
     * Bring the toolbar back if the browser hid it, the way a user would: tap the top
     * edge. Safari collapses its bars in landscape on compact iPhones, and keeps them
     * collapsed between visits. No-op when the toolbar shows up on its own.
     */
    public async reveal(): Promise<void> {
        const shown = await this.addressBar.waitForDisplayed({ timeout: 3000 }).then(() => true, () => false);
        if (shown) {
            return;
        }
        const { width } = await Device.getWindowSize();
        await tap(width / 2, 5);
        await this.waitForDisplayed();
    }

    /**
     * Address as shown, e.g. "saucelabs.com". Safari exposes it as value,
     * Firefox as content-desc, Chrome as text.
     */
    public async getAddress(): Promise<string> {
        if (driver.isIOS) {
            return (await this.addressBar.getAttribute('value')) ?? '';
        }
        const [text, description] = await Promise.all([
            this.addressBar.getText(),
            this.addressBar.getAttribute('content-desc'),
        ]);
        return text || description || '';
    }
}
