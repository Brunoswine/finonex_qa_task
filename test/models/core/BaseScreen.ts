import { BaseWidget, type WaitOptions } from './BaseWidget.js';

/**
 * Base for full screens. A screen is a widget without a root: it spans the whole viewport
 * and is composed of other widgets, exposed as `readonly` fields.
 */
export abstract class BaseScreen extends BaseWidget {
    /** Wait until the screen's trait element is displayed. */
    public async waitForLoaded(options: WaitOptions = {}): Promise<this> {
        return this.waitForDisplayed(options);
    }
}
