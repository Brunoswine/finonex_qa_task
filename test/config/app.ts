/** Identity of the app under test per platform, shared by the capabilities factory and the fixtures. */
export const APP = {
    android: {
        // No launch activity on purpose: builds of the app differ (the local APK starts
        // MainActivity, the one on BrowserStack an obfuscated class), so the driver reads
        // it from the APK manifest instead.
        appPackage: 'com.swaglabsmobileapp',
    },
    ios: {
        bundleId: 'com.saucelabs.SwagLabsMobileApp',
    },
} as const;