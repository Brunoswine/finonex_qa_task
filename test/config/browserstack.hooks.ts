import { driver } from '@wdio/globals';
import type { Services } from '@wdio/types';

/** WDIO hooks a run profile can contribute; wdio.conf.ts combines them with its own. */
export type SessionHooks = Pick<Services.HookFunctions, 'before' | 'beforeTest' | 'afterTest' | 'after'>;

/** BrowserStack truncates longer session status reasons. */
const MAX_REASON_LENGTH = 255;

const errorMessage = (error: unknown): string =>
    (error instanceof Error ? error.message : String(error)).split('\n')[0] ?? '';

/** "Suite test" name. WDIO does not fill `fullTitle` for Mocha tests in hooks. */
const testName = (test: { parent?: string; title: string }): string =>
    [test.parent, test.title].filter(Boolean).join(' ');

const truncate = (text: string): string =>
    text.length <= MAX_REASON_LENGTH ? text : `${text.slice(0, MAX_REASON_LENGTH - 1)}…`;

/** Send a command to the BrowserStack hub. The hub handles it; it never reaches the device. */
async function browserStackExecutor(action: string, args: Record<string, unknown>): Promise<void> {
    await driver.execute(`browserstack_executor: ${JSON.stringify({ action, arguments: args })}`);
}

/**
 * Report Mocha results to the BrowserStack dashboard, which otherwise leaves every session
 * "unmarked". The status belongs to the session, and WDIO opens one session per spec file,
 * so a session is marked failed when any of its tests failed. Each test start is annotated
 * on the session timeline, so the video and logs show where each test begins.
 *
 * wdio.conf.ts is evaluated in every worker, so each session gets its own `failures`.
 */
export function browserStackStatusHooks(): SessionHooks {
    const failures: string[] = [];

    return {
        beforeTest: async (test) => {
            await browserStackExecutor('annotate', { data: `Test: ${testName(test)}`, level: 'info' });
        },

        afterTest: async (test, _context, { passed, error }) => {
            if (!passed) {
                failures.push(`${testName(test)}: ${errorMessage(error)}`);
            }
        },

        // `result` is the spec's exit code: it also catches failures outside tests, e.g. in hooks.
        after: async (result) => {
            if (failures.length === 0 && result === 0) {
                await browserStackExecutor('setSessionStatus', { status: 'passed', reason: 'All tests passed' });
                return;
            }
            const summary = failures.length > 0
                ? `${failures.length} failed. ${failures[0]}`
                : 'Spec failed outside a test, e.g. in a hook';
            await browserStackExecutor('setSessionStatus', { status: 'failed', reason: truncate(summary) });
        },
    };
}
