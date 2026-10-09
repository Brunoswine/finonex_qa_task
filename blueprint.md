# Screen Blueprint (Swag Labs App)

Screens, widgets and locators of the app under test. Accessibility ids (`~test-...`) come from React Native `testID` and work on both platforms; platform-specific locators are listed only where the trees differ.

## 1. Login Screen
- **Login Screen** (`BaseScreen`, no top menu):
  - Username (`EditText`): accessibility-id `test-Username`
  - Password (`EditText`): accessibility-id `test-Password`
  - Login (`Button`): accessibility-id `test-LOGIN`
  - Biometry Login (`Button`): accessibility-id `test-biometry`

## 2. Global / Shared
- **Top Menu (Widget)**, on every screen except the login screen and the side menu:
  - Open side menu (`Button`): accessibility-id `test-Menu`
  - Shopping cart (`Button`): accessibility-id `test-Cart`

## 3. Side Menu
- **Side Menu (Widget)**, navigation to other parts of the app:
  - Close Side Menu (`Button`): accessibility-id `test-Close`
  - All Items (`Button`): accessibility-id `test-ALL ITEMS`
  - WebView (`Button`): accessibility-id `test-WEBVIEW`
  - QR Code Scanner (`Button`): accessibility-id `test-QR CODE SCANNER`
  - Geo Location (`Button`): accessibility-id `test-GEO LOCATION`
  - Drawing (`Button`): accessibility-id `test-DRAWING`
  - About (`Button`): accessibility-id `test-ABOUT`
  - Logout (`Button`): accessibility-id `test-LOGOUT`
  - Reset App State (`Button`): accessibility-id `test-RESET APP STATE` (the menu closes by itself afterwards)

## 4. Products Screen
**Extends:** `AuthenticatedScreen` (has the Top Menu)
**Locators:**
  - Sort By (`Button`): accessibility-id `test-Modal Selector Button`
  - Toggle Products Layout (`Button`): accessibility-id `test-Toggle`
  - Products Scroll View (contains the `test-Item` cards): accessibility-id `test-PRODUCTS`
  - Products Title (`Text`):
    - Android: `-android uiautomator` `new UiSelector().text("PRODUCTS")`
    - iOS: `-ios predicate string` `type == "XCUIElementTypeStaticText" AND name == "PRODUCTS"` (a container is also named "PRODUCTS")

**Nested Widget (ProductCard):**
`test-Item` matches every card, so one card is picked by index:
  - Android: `new UiSelector().description("test-Item").instance(N)` (only cards on screen are in the tree)
  - iOS: `-ios class chain` ``**/XCUIElementTypeOther[`name == "test-Item"`][N+1]`` (all cards are in the tree)

Inside the card:
  - Product Name (`TextView`): accessibility-id `test-Item title`
  - Price (`TextView`): accessibility-id `test-Price` (format: "$15.99")
  - Add to Cart (`Button`): accessibility-id `test-ADD TO CART`

Tree of a Test Item (Android):
```
<android.view.ViewGroup content-desc="test-Item">
    <android.view.ViewGroup>
        <android.widget.ImageView>
        <android.widget.TextView text="󰝁">
        <android.widget.TextView text="Sauce Labs Backpack" content-desc="test-Item title">
        <android.view.ViewGroup>
        <android.widget.TextView text="$29.99" content-desc="test-Price">
        <android.view.ViewGroup content-desc="test-Drag Handle">
            <android.widget.TextView text="󰇛">
        <android.view.ViewGroup content-desc="test-ADD TO CART">
            <android.widget.TextView text="ADD TO CART">
```

**Nested Widget (Sort Modal)**, opened by Sort By, options matched by visible text:
  - Options: `Name (A to Z)`, `Name (Z to A)`, `Price (low to high)`, `Price (high to low)`, `Cancel`
  - Android: `new UiSelector().text("<option>")`
  - iOS: `-ios predicate string` `name == "<option>" AND accessible == 1` (`Cancel` also exists on a non-accessible wrapper)

## 5. Drawing Screen
**Extends:** `AuthenticatedScreen` (has the Top Menu)
**Locators:**
  - Screen: accessibility-id `test-DRAWING-SCREEN`
  - Clear (`Button`): accessibility-id `test-CLEAR`
  - Save (`Button`): accessibility-id `test-SAVE`
  - Drawing Box: the WebView inside the screen (no `android.widget.Image` in the tree). Several WebView nodes are nested, take the outer one:
    - Android: `new UiSelector().className("android.webkit.WebView").instance(0)`
    - iOS: `-ios class chain` `**/XCUIElementTypeWebView[1]`

## 6. About → Browser
**Extends:** `BaseScreen` (it is another app, no Top Menu)
- **About opens saucelabs.com in the device's default browser**: Firefox or Chrome on Android, Safari on iOS.
  - Address bar:
    - Android: `new UiSelector().resourceIdMatches("ADDRESSBAR_URL_BOX|com.android.chrome:id/url_bar")`
    - iOS: `TextField` named `TabBarItemTitle` in portrait, `Button` named `UnifiedTabBarItemView…isSelected=true` in landscape
  - Page: the `WebView` (on iOS the one named `WebView`)
- Firefox may show a translation bottom sheet on non-English devices; Safari hides its toolbar in landscape on small iPhones.
