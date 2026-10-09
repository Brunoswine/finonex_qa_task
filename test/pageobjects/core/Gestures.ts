import { browser } from '@wdio/globals';
import type { ChainablePromiseElement } from 'webdriverio';

/** Point inside an element, as fractions of its size: {x: 0, y: 0} is top-left, {x: 1, y: 1} bottom-right. */
export interface RelativePoint {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export async function getRect(element: ChainablePromiseElement): Promise<Rect> {
    const [{ x, y }, { width, height }] = await Promise.all([element.getLocation(), element.getSize()]);
    return { x, y, width, height };
}

/**
 * Drag one finger through `points` inside `target`, using a W3C touch pointer action
 * (`browser.action('pointer')`), not the removed Appium TouchAction API.
 */
export async function drawPath(
    target: ChainablePromiseElement,
    points: readonly RelativePoint[],
    stepDurationMs = 100,
): Promise<void> {
    const [start, ...rest] = points;
    if (!start || rest.length === 0) {
        throw new Error('A path needs at least two points');
    }

    const rect = await getRect(target);
    const toViewport = ({ x, y }: RelativePoint) => ({
        x: Math.round(rect.x + x * rect.width),
        y: Math.round(rect.y + y * rect.height),
    });

    let gesture = browser
        .action('pointer', { parameters: { pointerType: 'touch' } })
        .move({ ...toViewport(start), duration: 0 })
        .down();
    for (const point of rest) {
        gesture = gesture.move({ ...toViewport(point), duration: stepDurationMs });
    }
    await gesture.up().perform();
}
