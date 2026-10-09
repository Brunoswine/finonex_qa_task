import { browser } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';
import { AuthenticatedScreen } from '../core/AuthenticatedScreen.js';
import type { SideMenuItem } from '../widgets/SideMenuWidget.js';
import { ProductCardWidget, type ProductSummary } from '../widgets/ProductCardWidget.js';
import { SortModalWidget, type SortOption } from '../widgets/SortModalWidget.js';

export class ProductsScreen extends AuthenticatedScreen {
    public static readonly menuItem: SideMenuItem = 'ALL ITEMS';

    public get title(): ChainablePromiseElement {
        return this.element({
            android: 'android=new UiSelector().text("PRODUCTS")',
            // iOS also has a container named "PRODUCTS"; only the label is a StaticText.
            ios: '-ios predicate string:type == "XCUIElementTypeStaticText" AND name == "PRODUCTS"',
        });
    }

    public get productList(): ChainablePromiseElement {
        return this.element('~test-PRODUCTS');
    }

    public get sortButton(): ChainablePromiseElement {
        return this.element('~test-Modal Selector Button');
    }

    public get toggleLayoutButton(): ChainablePromiseElement {
        return this.element('~test-Toggle');
    }

    protected get trait(): ChainablePromiseElement {
        return this.productList;
    }

    /** Card at the given zero-based position among the cards rendered on screen. */
    public productCard(index: number): ProductCardWidget {
        return new ProductCardWidget(index);
    }

    /** Cards in the tree: the on-screen ones on Android, all of them on iOS. */
    public async renderedProductCards(): Promise<ProductCardWidget[]> {
        const count = await this.elements('~test-Item').length;
        return Array.from({ length: count }, (_, index) => this.productCard(index));
    }

    public async openSortModal(): Promise<SortModalWidget> {
        await this.sortButton.click();
        return new SortModalWidget().waitForDisplayed();
    }

    public async sortBy(option: SortOption): Promise<void> {
        const modal = await this.openSortModal();
        await modal.select(option);
    }

    /**
     * Every product in display order, read from the UI text. Scrolls until a swipe reveals
     * nothing new, because cards below the fold cannot be read without scrolling.
     */
    public async collectAllProducts(maxSwipes = 10): Promise<ProductSummary[]> {
        const byTitle = new Map<string, ProductSummary>();
        for (let swipes = 0; swipes <= maxSwipes; swipes++) {
            const knownBefore = byTitle.size;
            for (const card of await this.renderedProductCards()) {
                const summary = await card.readSummary();
                if (summary && !byTitle.has(summary.title)) {
                    byTitle.set(summary.title, summary);
                }
            }
            if (swipes > 0 && byTitle.size === knownBefore) {
                return [...byTitle.values()];
            }
            await browser.swipe({ direction: 'up', scrollableElement: this.productList, percent: 0.5 });
        }
        throw new Error(`Product list did not end after ${maxSwipes} swipes`);
    }
}
