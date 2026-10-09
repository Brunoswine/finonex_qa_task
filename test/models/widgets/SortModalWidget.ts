import type { ChainablePromiseElement } from 'webdriverio';
import { BaseWidget } from '../core/BaseWidget.js';

/**
 * Sort options as labelled in the app. They are missing from blueprint.md, so
 * the options are matched by their visible text.
 */
export const SortOption = {
    NameAToZ: 'Name (A to Z)',
    NameZToA: 'Name (Z to A)',
    PriceLowToHigh: 'Price (low to high)',
    PriceHighToLow: 'Price (high to low)',
} as const;

export type SortOption = (typeof SortOption)[keyof typeof SortOption];

/** Modal opened by the products screen's "Sort By" button. */
export class SortModalWidget extends BaseWidget {
    public option(option: SortOption | 'Cancel'): ChainablePromiseElement {
        return this.element({
            android: `android=new UiSelector().text("${option}")`,
            // iOS repeats "Cancel" on a non-accessible wrapper; the tappable option is the accessible one.
            ios: `-ios predicate string:name == "${option}" AND accessible == 1`,
        });
    }

    protected get trait(): ChainablePromiseElement {
        return this.option('Cancel');
    }

    public async select(option: SortOption): Promise<void> {
        await this.option(option).click();
        await this.waitForHidden();
    }

    public async cancel(): Promise<void> {
        await this.option('Cancel').click();
        await this.waitForHidden();
    }
}
