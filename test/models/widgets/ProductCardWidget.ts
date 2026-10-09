import { $ } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { BaseWidget } from '../core/BaseWidget.js';
import { resolveLocator } from '../core/Locator.js';

export interface ProductSummary {
    title: string;
    price: number;
}

/** Turns a price label such as "$29.99" into 29.99. */
export const parsePrice = (label: string): number => {
    const value = Number.parseFloat(label.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(value)) {
        throw new Error(`Cannot parse price from "${label}"`);
    }
    return value;
};

/**
 * One product card (`test-Item`) in the products list. All children are queried
 * inside the card, so `~test-Price` resolves to this card's price only.
 */
export class ProductCardWidget extends BaseWidget {
    /**
     * @param index zero-based position of the card in the tree. Android only has the
     * cards on screen in the tree; iOS has the whole list, including off-screen cards.
     * Both selectors match exactly one card, which keeps `$` strict without the
     * blueprint's positional XPath. Class chain indexes start at 1.
     */
    constructor(public readonly index: number) {
        super(() => $(resolveLocator({
            android: `android=new UiSelector().description("test-Item").instance(${index})`,
            ios: `-ios class chain:**/XCUIElementTypeOther[\`name == "test-Item"\`][${index + 1}]`,
        })));
    }

    public get title(): ChainablePromiseElement {
        return this.element('~test-Item title');
    }

    public get price(): ChainablePromiseElement {
        return this.element('~test-Price');
    }

    public get addToCartButton(): ChainablePromiseElement {
        return this.element('~test-ADD TO CART');
    }

    protected get trait(): ChainablePromiseElement {
        return this.title;
    }

    public async getTitle(): Promise<string> {
        return this.title.getText();
    }

    public async getPrice(): Promise<number> {
        return parsePrice(await this.price.getText());
    }

    /** Title and price, or `null` while the card is cut off at the screen edge. */
    public async readSummary(): Promise<ProductSummary | null> {
        if (!(await this.title.isDisplayed()) || !(await this.price.isDisplayed())) {
            return null;
        }
        return { title: await this.getTitle(), price: await this.getPrice() };
    }

    public async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }
}
