import { expect, $ } from '@wdio/globals';

describe('Swag Labs App - Basic Navigation', () => {
    it('should successfully login and open side menu', async () => {
        // 1. Взаимодействие с Login Screen
        const usernameInput = await $('~test-Username');
        const passwordInput = await $('~test-Password');
        const loginBtn = await $('~test-LOGIN');

        // Ожидаем появления поля ввода (хорошая практика для медленных реальных девайсов)
        await usernameInput.waitForDisplayed({ timeout: 10000 });
        
        // Вводим стандартные учетные данные SauceLabs
        await usernameInput.setValue('standard_user');
        await passwordInput.setValue('secret_sauce');
        await loginBtn.click();

        // 2. Проверка перехода на Products Screen
        // Используем локатор Android UiAutomator из твоего blueprint
        const productsTitle = await $('android=new UiSelector().text("PRODUCTS")');
        const productsList = await $('~test-PRODUCTS');

        // Убеждаемся, что заголовок и сам список товаров появились на экране
        await expect(productsTitle).toBeDisplayed();
        await expect(productsList).toBeDisplayed();

        // 3. Взаимодействие с Top Menu Widget
        const openMenuBtn = await $('~test-Menu');
        await openMenuBtn.click();

        // 4. Проверка Side Menu
        const closeMenuBtn = await $('~test-Close');
        const aboutMenuBtn = await $('~test-ABOUT');

        // Проверяем, что меню открылось и кнопка About доступна
        await expect(aboutMenuBtn).toBeDisplayed();
        
        // Закрываем боковое меню
        await closeMenuBtn.click();
        
        // Убеждаемся, что меню закрылось (кнопка исчезла)
        await expect(closeMenuBtn).not.toBeDisplayed();
    });
});