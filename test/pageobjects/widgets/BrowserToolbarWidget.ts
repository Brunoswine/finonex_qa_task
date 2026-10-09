import type { ChainablePromiseElement } from 'webdriverio';
import { BaseWidget } from '../core/BaseWidget.js';

/**
 * Address bar of the external browser the app hands links to. Which browser that is
 * depends on the device default, so the locator matches the known ones:
 * Firefox (`ADDRESSBAR_URL_BOX` test tag) and Chrome (`url_bar`).
 */
export class BrowserToolbarWidget extends BaseWidget {
    public get addressBar(): ChainablePromiseElement {
        return this.element(
            'android=new UiSelector().resourceIdMatches("ADDRESSBAR_URL_BOX|com.android.chrome:id/url_bar")',
        );
    }

    protected get trait(): ChainablePromiseElement {
        return this.addressBar;
    }

    /** Address as shown. Firefox exposes it as content-desc, Chrome as text. */
    public async getAddress(): Promise<string> {
        const [text, description] = await Promise.all([
            this.addressBar.getText(),
            this.addressBar.getAttribute('content-desc'),
        ]);
        return text || description || '';
    }
}
