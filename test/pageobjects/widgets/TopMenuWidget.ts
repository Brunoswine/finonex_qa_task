import type { ChainablePromiseElement } from 'webdriverio';
import { BaseWidget } from '../core/BaseWidget.js';
import { SideMenuWidget } from './SideMenuWidget.js';

/** Header shown on every authenticated screen. */
export class TopMenuWidget extends BaseWidget {
    public get menuButton(): ChainablePromiseElement {
        return this.element('~test-Menu');
    }

    public get cartButton(): ChainablePromiseElement {
        return this.element('~test-Cart');
    }

    protected get trait(): ChainablePromiseElement {
        return this.menuButton;
    }

    public async openSideMenu(): Promise<SideMenuWidget> {
        await this.menuButton.click();
        return new SideMenuWidget().waitForDisplayed();
    }
}
