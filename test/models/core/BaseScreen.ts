import { BaseWidget, type WaitOptions } from './BaseWidget.js';

/**
 * Base for full screens. A screen is a root-less widget: it spans the whole viewport,
 * and its public API is the widgets it is composed of plus screen-level flows.
 * Child widgets are exposed as `readonly` fields and are not inherited.
 */
export abstract class BaseScreen extends BaseWidget {
    constructor() {
        super();
    }

    /** Wait until the screen's trait element is displayed. */
    public async waitForLoaded(options: WaitOptions = {}): Promise<this> {
        return this.waitForDisplayed(options);
    }
}
