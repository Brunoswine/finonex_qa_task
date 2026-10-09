import { BaseScreen } from './BaseScreen.js';
import { TopMenuWidget } from '../widgets/TopMenuWidget.js';

/**
 * Base for every screen behind login. Per the blueprint, all of these screens show
 * the top menu, so it is composed here once instead of in each screen.
 */
export abstract class AuthenticatedScreen extends BaseScreen {
    public readonly topMenu = new TopMenuWidget();
}
