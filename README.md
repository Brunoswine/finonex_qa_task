# Swag Labs Mobile E2E Tests

E2E tests for the [Swag Labs sample app](https://github.com/saucelabs/sample-app-mobile/releases/tag/2.7.1) on Android and iOS: product sorting, clearing the drawing canvas, and rotating the browser opened from About.

Stack: WebdriverIO v10, Appium, Mocha, TypeScript, Allure. Runs locally or on BrowserStack.

## Install

- Node.js 22.19+
- Appium 3 with drivers:
  ```sh
  npm install -g appium
  appium driver install uiautomator2
  appium driver install xcuitest
  ```
- Android SDK, with `ANDROID_HOME` exported
- Xcode with an iOS Simulator

Then install dependencies:

```sh
npm install
```

## Fill in `.env`

```sh
cp .env.example .env
```

```dotenv
STANDARD_USER=standard_user
STANDARD_USER_PASSWORD=secret_sauce

RUN_TARGET=local                 # local | browserstack
PLATFORM=android                 # android | ios

# Local
APPIUM_DEVICE_ID=                # device / simulator UDID (required for iOS)
ANDROID_APP_PATH=/path/to/app.apk
IOS_APP_PATH=/path/to/app.app

# BrowserStack
BROWSERSTACK_USERNAME=
BROWSERSTACK_ACCESS_KEY=
ANDROID_BS_APP=bs://...
IOS_BS_APP=bs://...
```

App builds: [release 2.7.1](https://github.com/saucelabs/sample-app-mobile/releases/tag/2.7.1).

## Run

Locally (`RUN_TARGET=local`, device connected or simulator booted):

```sh
npx wdio run wdio.conf.ts
```

A single spec file:

```sh
npx wdio run wdio.conf.ts --spec test/specs/swaglabs.e2e.ts
```

On BrowserStack (`RUN_TARGET=browserstack`): upload the builds once and put the returned `bs://...` ids into `ANDROID_BS_APP` / `IOS_BS_APP`:

```sh
curl -u "USERNAME:ACCESS_KEY" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@/path/to/app.apk"
```

Then run:

```sh
npx wdio run wdio.conf.ts                # Default Samsung Galaxy S23, Android 13
PLATFORM=ios npx wdio run wdio.conf.ts   # Default iPhone SE 2022, iOS 15
```

Any `.env` value can be overridden for one run:

```sh
PLATFORM=ios npx wdio run wdio.conf.ts
ANDROID_BS_DEVICE_NAME="Google Pixel 7" ANDROID_BS_PLATFORM_VERSION=13.0 npx wdio run wdio.conf.ts
```

## Report

```sh
rm -rf allure-report
npx allure generate allure-results --output allure-report --open
```

Results of all runs are collected in one report. To start over: `rm -rf allure-results allure-report`.

## Decisions and known issues

- **iPhones with a notch.** The app is not optimized for notched iPhones: on an iPhone 15 the notch covers the app header. iOS runs on BrowserStack therefore default to the iPhone SE 2022.
- **Appium version on BrowserStack.** BrowserStack starts Appium 1.x unless told otherwise, and 1.x does not support the W3C actions that WebdriverIO v10 uses for gestures. The config pins Appium 3.5.2 for Android and 2.19.0 for iOS, because 3.x is not available for the iPhone SE 2022. If a pinned version is missing for a device, BrowserStack silently falls back to 1.x: gestures then fail with `"actions" with method "DELETE"`.
- **Unstable runs.**
  - Pixel 8 (Android 14) on BrowserStack: the app sometimes does not come back after a restart, and the home screen stays open. The app targets Android 9, which is the likely cause. Galaxy S23 and Pixel 7 on Android 13 are stable.
  - Safari on the iOS Simulator: the browser is flacky on simulator now. Test cannot find Safari's page view, depending on the state Safari was left in. On BrowserStack or Real Device the same test passes.
