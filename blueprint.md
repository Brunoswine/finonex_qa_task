# Архитектура экранов (Swag Labs App)

## 1. Login Screen
- **Login Screen**: 
  - Username (`Edit Text`): accessibility-id `test-Username`
  - Password (`Edit Text`): accessibility-id `test-Password`
  - Login (`Button`): accessibility-id `test-LOGIN`
  - Biometry Login (`Button`): accessibility-id `test-biometry`
  - Logo Image: xpath `//android.widget.ScrollView[@content-desc="test-Login"]/android.view.ViewGroup/android.widget.ImageView[1]`
  - Logo Image: -android uiautomator `new UiSelector().className("android.widget.ImageView").instance(0)`

## 2. Global / Shared
- **Top Menu (Widget) All screens have it except side menu and login screen**: 
  - Open side menu (`Button`): accessibility-id `test-Menu`
  - Shopping cart (`Button`): accessibility-id `test-Cart`

## 3. Side Menu
- **Side Menu - Navigation to other parts of the App**: 
  - Close Side Menu (`(`Button`)`): accessibility-id `test-Close`
  - All Items (`Button`): accessibility-id `test-ALL ITEMS`
  - WebView (`Button`): accessibility-id `test-WEBVIEW`
  - QR Code Scanner (`Button`): accessibility-id `test-QR CODE SCANNER`
  - Geo Location (`Button`): accessibility-id `test-GEO LOCATION`
  - Drawing (`Button`): accessibility-id `test-DRAWING`
  - About (`Button`): accessibility-id `test-ABOUT`
  - Logout (`Button`): accessibility-id `test-LOGOUT`
  - Reset App State (`Button`): accessibility-id `test-RESET APP STATE`


## 4. Products Screen
**Наследует:** BaseScreen (имеет доступ к Top Menu)
**Локаторы:**
  - Sort By (`Button`): accessibility-id `test-Modal Selector (`Button`)`
  - Toggle Products Layout (`Button`): accessibility-id `test-Toggle`
  - Sort By (`Button`): accessibility-id `test-Modal Selector (`Button`)`
  - Products Scroll View(contains Products - test-Item): accessibility-id `test-PRODUCTS`
  - Products Text: xpath `new UiSelector().text("PRODUCTS")`
  - Products Text: -android uiautomator `test-Modal Selector (`Button`)`

**Вложенный Widget (ProductItem):**
Ищется внутри `test-Item`: xpath `(//android.view.ViewGroup[@content-desc="test-Item"])[1]`
Ищется внутри `test-Item`:
- Product Name Text (`TextView`): accessibility-id `test-Item title`
- Price (`TextView`): accessibility-id `test-Price` (формат: "$15.99")

Tree of on Test Item Example
<android.view.ViewGroup content-desc="test-Item">
    <android.view.ViewGroup>
        <android.widget.ImageView>
        <android.widget.TextView text="󰝁">
        <android.widget.TextView text="Sauce Labs Backpack" content-desc="test-Item title">
        <android.view.ViewGroup>
        <android.widget.TextView text="$29.99" content-desc="test-Price"> : xpath //android.widget.TextView[@content-desc="test-Price" and @text="$29.99"]
        <android.view.ViewGroup content-desc="test-Drag Handle">
            <android.widget.TextView text="󰇛">
        <android.view.ViewGroup content-desc="test-ADD TO CART">
            <android.widget.TextView text="ADD TO CART">

## 4. Drawing Screen
**Наследует:** BaseScreen (имеет доступ к Top Menu)
**Локаторы:**
  - Screen: accessibility-id `test-DRAWING-SCREEN`
  - Clear (`Button`): accessibility-id `test-CLEAR`
  - Save (`Button`): accessibility-id `test-SAVE`
  - Drawing Box: xpath `//android.widget.Image`

## 5. About Menu
- **Opens a Website**: 



