import { browser, driver } from '@wdio/globals';

export type Orientation = 'PORTRAIT' | 'LANDSCAPE';

export interface Size {
    width: number;
    height: number;
}

const isOrientation = (value: string): value is Orientation =>
    value === 'PORTRAIT' || value === 'LANDSCAPE';

/** Device-level actions that are not tied to a specific screen. */
export const Device = {
    async getOrientation(): Promise<Orientation> {
        const orientation = (await driver.getOrientation()).toUpperCase();
        if (!isOrientation(orientation)) {
            throw new Error(`Unexpected device orientation: "${orientation}"`);
        }
        return orientation;
    },

    /**
     * Rotate and wait until the device reports the new orientation. The foreground app
     * must allow it: an app locked to portrait in its manifest makes the driver throw.
     */
    async setOrientation(orientation: Orientation): Promise<void> {
        await driver.setOrientation(orientation);
        await browser.waitUntil(
            async () => (await Device.getOrientation()) === orientation,
            { timeoutMsg: `Device did not rotate to ${orientation}` },
        );
    },

    async getWindowSize(): Promise<Size> {
        const { width, height } = await driver.getWindowSize();
        return { width, height };
    },
};
