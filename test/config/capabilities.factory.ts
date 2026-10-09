import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { driver } from '@wdio/globals';
import { APP } from './app.js';
import { browserStackStatusHooks, type SessionHooks } from './browserstack.hooks.js';
import { env, type Platform, type RunTarget } from './env.js';

/** The part of wdio.conf.ts that depends on where and on what the tests run. */
export interface RunProfile
    extends Pick<WebdriverIO.Config, 'hostname' | 'port' | 'protocol' | 'path' | 'user' | 'key'> {
    capabilities: WebdriverIO.Capabilities[];
    services: NonNullable<WebdriverIO.Config['services']>;
    maxInstances: number;
    /** Target-specific WDIO hooks, e.g. simulator setup or reporting results to a cloud. */
    hooks: SessionHooks;
}

const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** Capabilities that only depend on the platform, wherever the device is. */
const PLATFORM_CAPABILITIES: Record<Platform, WebdriverIO.Capabilities> = {
    android: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': APP.android.appPackage,
    },
    ios: {
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:bundleId': APP.ios.bundleId,
    },
};

const APP_EXTENSIONS: Record<Platform, readonly string[]> = {
    android: ['.apk', '.aab'],
    ios: ['.ipa', '.app', '.zip'],
};

interface BrowserStackDevice {
    deviceName: string;
    platformVersion: string;
    appiumVersion: string;
}

/**
 * Default device per platform; <PLATFORM>_BS_DEVICE_NAME / _PLATFORM_VERSION override it.
 * - iOS uses an iPhone without a notch: the app predates them, and the notch covers its header.
 * - Appium is pinned because BrowserStack defaults to 1.x, which lacks W3C action release
 *   (DELETE /actions) used by WDIO v10 gestures. Not every version exists for every device,
 *   and BrowserStack then falls back to 1.x silently: 3.x is not offered for the iPhone SE
 *   2022 / iOS 15, 2.19.0 is. Check the Appium log of a session after changing the device.
 */
const BROWSERSTACK_DEFAULT_DEVICE: Record<Platform, BrowserStackDevice> = {
    android: { deviceName: 'Samsung Galaxy S23', platformVersion: '13.0', appiumVersion: '3.5.2' },
    ios: { deviceName: 'iPhone SE 2022', platformVersion: '15', appiumVersion: '2.19.0' },
};

/** Absolute path to the local build, checked to exist and to fit the platform. */
function resolveLocalApp(platform: Platform): string {
    const variable = platform === 'android' ? 'ANDROID_APP_PATH' : 'IOS_APP_PATH';
    const appPath = resolve(PROJECT_ROOT, env.localAppPath(platform));
    if (!APP_EXTENSIONS[platform].includes(extname(appPath).toLowerCase())) {
        throw new Error(
            `${variable}="${appPath}" is not a ${platform} build. Expected ${APP_EXTENSIONS[platform].join(', ')}.`,
        );
    }
    if (!existsSync(appPath)) {
        throw new Error(`${variable}="${appPath}" does not exist.`);
    }
    return appPath;
}

/** True if the udid belongs to an iOS simulator on this Mac, not a real device. */
function isIosSimulator(udid: string): boolean {
    const output = execFileSync('xcrun', ['simctl', 'list', 'devices', '--json'], { encoding: 'utf8' });
    const { devices } = JSON.parse(output) as { devices: Record<string, { udid: string }[]> };
    return Object.values(devices).flat().some((device) => device.udid === udid);
}

/**
 * Type through an English QWERTY keyboard. The simulator keeps the layout last used, and
 * XCUITest cannot type Latin text through e.g. a Russian layout: secure fields then
 * receive only part of the password and login fails.
 */
async function useEnglishSimulatorKeyboard(): Promise<void> {
    await driver.execute('mobile: configureLocalization', { keyboard: { name: 'en_US', layout: 'QWERTY' } });
}

function localProfile(platform: Platform): RunProfile {
    const udid = env.appiumDeviceId;
    if (platform === 'ios' && !udid) {
        throw new Error('APPIUM_DEVICE_ID (device or simulator udid) is required for local iOS runs.');
    }
    const onIosSimulator = platform === 'ios' && udid !== undefined && isIosSimulator(udid);
    return {
        hooks: onIosSimulator ? { before: useEnglishSimulatorKeyboard } : {},
        capabilities: [{
            ...PLATFORM_CAPABILITIES[platform],
            'appium:app': resolveLocalApp(platform),
            ...(udid ? { 'appium:udid': udid } : {}),
            ...(platform === 'android' ? { 'appium:noSign': true } : {}),
        }],
        services: [['appium', { command: 'appium' }]],
        // One physical device cannot run sessions in parallel.
        maxInstances: 1,
    };
}

function browserStackProfile(platform: Platform): RunProfile {
    const settings = env.browserStack(platform);
    const app = env.browserStackApp(platform);
    if (!app.startsWith('bs://')) {
        throw new Error(`BrowserStack app must be an uploaded app id (bs://...), got "${app}".`);
    }
    const device = BROWSERSTACK_DEFAULT_DEVICE[platform];
    return {
        protocol: 'https',
        hostname: 'hub.browserstack.com',
        port: 443,
        path: '/wd/hub',
        user: settings.username,
        key: settings.accessKey,
        capabilities: [{
            ...PLATFORM_CAPABILITIES[platform],
            'appium:app': app,
            'appium:deviceName': settings.deviceName ?? device.deviceName,
            'appium:platformVersion': settings.platformVersion ?? device.platformVersion,
            'bstack:options': {
                appiumVersion: device.appiumVersion,
                projectName: 'Swag Labs',
                buildName: settings.buildName ?? `${platform} ${new Date().toISOString().slice(0, 10)}`,
                debug: true,
            },
        }],
        services: [],
        hooks: browserStackStatusHooks(),
        maxInstances: 1,
    };
}

const PROFILES: Record<RunTarget, (platform: Platform) => RunProfile> = {
    local: localProfile,
    browserstack: browserStackProfile,
};

/** Build the run profile from RUN_TARGET and PLATFORM in `.env`. */
export function createRunProfile(): RunProfile {
    return PROFILES[env.runTarget](env.platform);
}
