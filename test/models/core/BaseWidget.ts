import { $, $$ } from '@wdio/globals';
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';
import { resolveLocator, type Locator } from './Locator.js';

/** Lazily resolves the element a widget is scoped to. */
export type RootLocator = () => ChainablePromiseElement;

export interface WaitOptions {
    timeout?: number;
}

/**
 * Base for every UI component. A widget is a reusable group of elements.
 *
 * - With a `root`, every child query is scoped to that element. The same widget class
 *   can then be reused for every instance, e.g. one ProductCardWidget per card.
 * - Without a `root`, queries run against the whole viewport. Use this for overlays
 *   that have no container locator, such as the side menu.
 *
 * Elements are returned as lazy chainable promises and are never cached, so every
 * access re-queries the app. Stale elements after rotation or navigation are not an issue.
 */
export abstract class BaseWidget {
    constructor(private readonly rootLocator?: RootLocator) {}

    /** Element whose presence proves the widget is rendered. */
    protected abstract get trait(): ChainablePromiseElement;

    protected get root(): ChainablePromiseElement | undefined {
        return this.rootLocator?.();
    }

    /** Query exactly one element in the widget's scope (strict: throws on >1 match). */
    protected element(locator: Locator): ChainablePromiseElement {
        const selector = resolveLocator(locator);
        const root = this.root;
        return root ? root.$(selector) : $(selector);
    }

    /** Query all matching elements in the widget's scope. */
    protected elements(locator: Locator): ChainablePromiseArray {
        const selector = resolveLocator(locator);
        const root = this.root;
        return root ? root.$$(selector) : $$(selector);
    }

    public async waitForDisplayed(options: WaitOptions = {}): Promise<this> {
        await this.trait.waitForDisplayed(options);
        return this;
    }

    public async waitForHidden(options: WaitOptions = {}): Promise<void> {
        await this.trait.waitForDisplayed({ ...options, reverse: true });
    }

    public async isDisplayed(): Promise<boolean> {
        return this.trait.isDisplayed();
    }
}
