import type { ChainablePromiseElement } from 'webdriverio';
import { BaseScreen } from '../core/BaseScreen.js';
import { ProductsScreen } from './ProductsScreen.js';
import type { Credentials } from '../../config/env.js';

export class LoginScreen extends BaseScreen {
    public get usernameInput(): ChainablePromiseElement {
        return this.element('~test-Username');
    }

    public get passwordInput(): ChainablePromiseElement {
        return this.element('~test-Password');
    }

    public get loginButton(): ChainablePromiseElement {
        return this.element('~test-LOGIN');
    }

    public get biometryButton(): ChainablePromiseElement {
        return this.element('~test-biometry');
    }

    protected get trait(): ChainablePromiseElement {
        return this.loginButton;
    }

    /** Submit the form without asserting the result, e.g. for negative tests. */
    public async submit({ username, password }: Credentials): Promise<void> {
        await this.usernameInput.setValue(username);
        await this.passwordInput.setValue(password);
        await this.loginButton.click();
    }

    /** Log in and return the loaded products screen. */
    public async login(credentials: Credentials): Promise<ProductsScreen> {
        await this.submit(credentials);
        return new ProductsScreen().waitForLoaded();
    }
}
