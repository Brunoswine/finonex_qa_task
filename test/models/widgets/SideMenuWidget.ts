import type { ChainablePromiseElement } from 'webdriverio';
import { BaseWidget } from '../core/BaseWidget.js';
import type { BaseScreen } from '../core/BaseScreen.js';

export type SideMenuItem =
    | 'ALL ITEMS'
    | 'WEBVIEW'
    | 'QR CODE SCANNER'
    | 'GEO LOCATION'
    | 'DRAWING'
    | 'ABOUT'
    | 'LOGOUT'
    | 'RESET APP STATE';

/**
 * A screen class reachable from the side menu. Each screen declares its own menu item,
 * so this widget never imports screens. That avoids a circular import, because those
 * screens contain the top menu, which opens this widget.
 */
export interface SideMenuDestination<T extends BaseScreen> {
    new (): T;
    readonly menuItem: SideMenuItem;
}

/** Navigation drawer opened from the top menu. */
export class SideMenuWidget extends BaseWidget {
    public get closeButton(): ChainablePromiseElement {
        return this.element('~test-Close');
    }

    public item(item: SideMenuItem): ChainablePromiseElement {
        return this.element(`~test-${item}`);
    }

    protected get trait(): ChainablePromiseElement {
        return this.closeButton;
    }

    /** Open a screen from the menu and return it once loaded. */
    public async navigateTo<T extends BaseScreen>(destination: SideMenuDestination<T>): Promise<T> {
        await this.item(destination.menuItem).click();
        return new destination().waitForLoaded();
    }

    /** Clears cart and sorting. The app closes the menu on its own afterwards. */
    public async resetAppState(): Promise<void> {
        await this.item('RESET APP STATE').click();
        await this.waitForHidden();
    }

    public async close(): Promise<void> {
        await this.closeButton.click();
        await this.waitForHidden();
    }
}
