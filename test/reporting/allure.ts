import { browser } from '@wdio/globals';
import { addArgument, addAttachment, addHistoryId, addSuite } from '@wdio/allure-reporter';
import { createHash } from 'node:crypto';

export { step } from '@wdio/allure-reporter';

/** Attach a screenshot of the current screen to the Allure report under `name`. */
export async function attachScreenshot(name: string): Promise<void> {
    const png = await browser.takeScreenshot();
    await addAttachment(name, Buffer.from(png, 'base64'), 'image/png');
}

/** The session's device in words, e.g. "Google Pixel 8, Android 14.0", from the requested capabilities. */
function describeSessionDevice(): string {
    const caps = (browser.requestedCapabilities ?? {}) as WebdriverIO.Capabilities;
    const platform = caps.platformName ?? 'unknown platform';
    const name = caps['appium:deviceName'] ?? caps['appium:udid'];
    const version = caps['appium:platformVersion'];
    if (!name) {
        return platform;
    }
    return version ? `${name}, ${platform} ${version}` : `${name}, ${platform}`;
}

/**
 * Group the test under its device and keep runs on different devices apart. Without this the
 * reporter takes the device from the session response, where BrowserStack reports every
 * Android phone as just "Android", and merges them into one test with retries.
 * The reporter already makes the describe block the parent suite; the device is the suite below it.
 */
export async function labelTestWithDevice(test: { parent?: string; title: string }): Promise<void> {
    const device = describeSessionDevice();
    await addSuite(device);
    await addArgument('device', device);
    await addHistoryId(createHash('md5').update(`${test.parent ?? ''} ${test.title}#${device}`).digest('hex'));
}
