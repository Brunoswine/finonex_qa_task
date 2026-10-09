import { $, $$ } from '@wdio/globals';
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';
import { resolveLocator, type Locator } from './Locator.js';

/** Lazily resolves the element a widget is scoped to. */
export type RootLocator = () => ChainablePromiseElement;

export interface WaitOptions {
    timeout?: number;
}

/**
 * Base for every UI component.
 *
 * - With a `root`, child queries are scoped to it, so one class serves every instance
 *   (e.g. one ProductCardWidget per card).
 * - Without a `root`, queries run against the whole screen (e.g. the side menu).
 *
 * Elements are never cached, so they do not go stale after rotation or navigation.
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
