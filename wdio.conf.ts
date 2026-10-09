import { createRunProfile } from './test/config/capabilities.factory.js';
import { attachScreenshot, labelTestWithDevice } from './test/reporting/allure.js';

// Target (local / BrowserStack) and platform (Android / iOS) come from .env.
const { capabilities, services, maxInstances, hooks, environment, ...connection } = createRunProfile();

export const config: WebdriverIO.Config = {
    ...connection,
    runner: 'local',
    tsConfigPath: './tsconfig.json',

    specs: ['./test/specs/**/*.ts'],
    capabilities,
    maxInstances,
    services,

    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        // Safari on iOS answers about one query per second, 60 s is too short for the browser test.
        timeout: 120000,
    },

    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            reportedEnvironmentVars: environment,
            // Tests attach their own named screenshots; per-command steps would only add noise.
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: true,
        }],
    ],

    before: hooks.before,

    beforeTest: [
        async function (test) {
            await labelTestWithDevice(test);
        },
        ...(hooks.beforeTest ? [hooks.beforeTest] : []),
    ],

    afterTest: [
        async function (_test, _context, { passed }) {
            if (!passed) {
                await attachScreenshot('On failure');
            }
        },
        ...(hooks.afterTest ? [hooks.afterTest] : []),
    ],

    after: hooks.after,
};
