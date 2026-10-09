import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

export interface Credentials {
    username: string;
    password: string;
}

export const RUN_TARGETS = ['local', 'browserstack'] as const;
export type RunTarget = (typeof RUN_TARGETS)[number];

export const PLATFORMS = ['android', 'ios'] as const;
export type Platform = (typeof PLATFORMS)[number];

export interface BrowserStackSettings {
    username: string;
    accessKey: string;
    deviceName?: string;
    platformVersion?: string;
    buildName?: string;
}

const optional = (name: string): string | undefined => process.env[name]?.trim() || undefined;

const required = (name: string): string => {
    const value = optional(name);
    if (!value) {
        throw new Error(`Missing env variable ${name}. Copy .env.example to .env and fill it in.`);
    }
    return value;
};

const oneOf = <T extends string>(name: string, allowed: readonly T[], fallback: T): T => {
    const value = (optional(name) ?? fallback).toLowerCase();
    if (!(allowed as readonly string[]).includes(value)) {
        throw new Error(`${name}="${value}" is not supported. Use one of: ${allowed.join(', ')}.`);
    }
    return value as T;
};

const byPlatform = (platform: Platform, android: string, ios: string): string =>
    platform === 'android' ? android : ios;

/** Typed access to `.env`. Values are read lazily so a missing variable fails only what needs it. */
export const env = {
    get standardUser(): Credentials {
        return {
            username: required('STANDARD_USER'),
            password: required('STANDARD_USER_PASSWORD'),
        };
    },

    get runTarget(): RunTarget {
        return oneOf('RUN_TARGET', RUN_TARGETS, 'local');
    },

    get platform(): Platform {
        return oneOf('PLATFORM', PLATFORMS, 'android');
    },

    /** udid of the local device or simulator. Optional on Android, where Appium picks the only device. */
    get appiumDeviceId(): string | undefined {
        return optional('APPIUM_DEVICE_ID');
    },

    localAppPath(platform: Platform): string {
        return required(byPlatform(platform, 'ANDROID_APP_PATH', 'IOS_APP_PATH'));
    },

    browserStackApp(platform: Platform): string {
        return required(byPlatform(platform, 'ANDROID_BS_APP', 'IOS_BS_APP'));
    },

    /** Device settings are per platform, so switching PLATFORM never pairs iOS with an Android device. */
    browserStack(platform: Platform): BrowserStackSettings {
        return {
            username: required('BROWSERSTACK_USERNAME'),
            accessKey: required('BROWSERSTACK_ACCESS_KEY'),
            deviceName: optional(byPlatform(platform, 'ANDROID_BS_DEVICE_NAME', 'IOS_BS_DEVICE_NAME')),
            platformVersion: optional(byPlatform(platform, 'ANDROID_BS_PLATFORM_VERSION', 'IOS_BS_PLATFORM_VERSION')),
            buildName: optional('BS_BUILD_NAME'),
        };
    },
};
