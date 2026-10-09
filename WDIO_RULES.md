# WebdriverIO v10 + Appium TypeScript Architecture Guidelines

## 1. Architectural Pattern: Screen & Widget Object Model
Do not use classic flat Page Objects. Use a compositional Widget-based architecture.
- **BaseWidget**: A base class taking a WebdriverIO element (`ChainablePromiseElement`) as `this.root`. All internal locators must be scoped to `this.root` (e.g., `this.root.$('...')`).
- **Widgets**: Independent UI components (e.g., `ProductCardWidget`, `TopMenuWidget`, `SideMenuWidget`).
- **BaseScreen**: A base class for all screens. Contains global widgets (e.g., `TopMenuWidget`) and screen-specific wait methods (e.g., `waitForScreenToLoad()`).
- **Screens**: Compose multiple widgets. Return Widget instances from getter methods (e.g., `get productCards() { return $$('~test-Item').map(el => new ProductCardWidget(el)); }`).

## 2. WebdriverIO v10 Syntax Rules
- Everything is fully asynchronous. EVERY action (`click`, `setValue`, `getText`) and selector (`$`, `$$`) MUST be prefixed with `await`.
- Never use synchronous code or `browser.pause()`.
- Use `expect-webdriverio` assertions (e.g., `await expect(element).toBeDisplayed()`).
- Use relative selectors inside widgets (e.g., `await this.root.$('~test-Price').getText()`).
- Do not use XPath unless absolutely necessary. Rely on accessibility id (`~`) and `-android uiautomator`.
