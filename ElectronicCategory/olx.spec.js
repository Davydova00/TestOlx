const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.olx.ua/uk/');
});
test.describe('Checking the “Electronic Category” search engine on OLX.', () => {
  test('Checking the page language', async ({ page }) => {
    const pageTitle = await page.title();
    console.log('Page title is:', pageTitle);

    await expect(page).toHaveURL('https://www.olx.ua/uk/');
    await expect(page).toHaveTitle(
      'Оголошення OLX.ua: сервіс оголошень України — купівля/продаж бу та нових товарів, різноманітні послуги на сайті OLX.ua'
    );
  });
  test('Checking the transition to a category', async ({ page }) => {
    const categories = await page.locator('//div[@class="css-1rwzo2t"]');
    await categories.waitFor();
    const links = await page.$$('div.css-1rwzo2t a');
    await expect(links).toHaveLength(18);

    const hrefs = await page.$$eval(
      '//div[@class="css-1rwzo2t"]//a',
      (anchors) => anchors.map((a) => a.getAttribute('href')));
    await expect(hrefs).toEqual([
      '/uk/dopomoga/',
      '/uk/detskiy-mir/',
      '/uk/nedvizhimost/',
      '/uk/transport/',
      '/uk/zapchasti-dlya-transporta/',
      '/uk/katehoriya-rabota',
      '/uk/zhivotnye/',
      '/uk/dom-i-sad/',
      '/uk/elektronika/',
      '/uk/uslugi/',
      '/uk/arenda-prokat/',
      '/uk/moda-i-stil/',
      '/uk/hobbi-otdyh-i-sport/',
      '/uk/otdam-darom/',
      '/uk/obmen-barter/',
      '/uk/transport/legkovye-avtomobili/q-авто-для зсу/?utm_source=olx&utm_medium=virtual_category&utm_campaign=avto_dlya_zsu',
      '/uk/rabota/zsu/?utm_source=promocategory&utm_medium=zsu&utm_campaign=zsu_promocategory',
      '/uk/zapchasti-dlya-transporta/shiny-diski-i-kolesa/?utm_source=olx&utm_medium=virtual_category&utm_campaign=tires_rims',
    ]);
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
  });
  test('Checking the existence of a search/location field', async ({page}) => {
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
    const searchInputLocator = page.locator("//input[@id='search']");
    const locationInputLocator = page.locator("//input[@id='location-input']");
    await expect(searchInputLocator).toBeVisible();
    await expect(locationInputLocator).toBeVisible();
    const divLocator = page.locator("//div[@class='css-c5h5gn']");
    await expect(divLocator).toContainText('Категорія');
    await expect(divLocator).toContainText('Ціна');
    await expect(divLocator).toContainText('Стан');
    await expect(divLocator).toContainText('Товари для блекауту');
  });
  test('Checking the search for the word "Телефон" and the presence of filters', async ({page}) => {
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
    page.locator("//input[@id='search']").fill('Телефон');
    page.locator("//button[@name='searchBtn']").click();
    const divLocator = page.locator("//div[@class='css-c5h5gn']");
    await page.waitForTimeout(5000);
    await expect(divLocator).toContainText('Категорія');
    await expect(divLocator).toContainText('Марка телефону');
    await expect(divLocator).toContainText('Операційна система');
    await expect(divLocator).toContainText('Діагональ екрану');
    await expect(divLocator).toContainText('Ціна');
    await expect(divLocator).toContainText('Стан');
    await expect(divLocator).toContainText('Товари для блекауту');
  });
  test('Checking the input of invalid values', async ({ page }) => {
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
    page.locator("//input[@id='search']").fill('123456qwer');
    page.locator("//button[@name='searchBtn']").click();
    const locator1 = page.locator("//div[@class='css-asqnhr']");
    const locator2 = page.locator("//p[@class='css-1oc165u er34gjf0']");
    await page.waitForTimeout(5000);
    await expect(locator1).toContainText('Ми знайшли  0 оголошень');
    await expect(locator2).toContainText('Ми нічого не знайшли, тому підібрали рекламні оголошення, подібні до тих, які ви нещодавно переглядали:');
  });
  test.only('Checking autocomplete field', async ({ page }) => {
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
    const searchInput = page.locator("//input[@id='search']");
    await searchInput.fill('Телефон');
    await page.locator("//button[@name='searchBtn']").click();
    await page.waitForTimeout(3000);
    await page.locator("//button[@data-testid='clear-btn']").click();
    await searchInput.fill('Телефон');
    await searchInput.click();
    const locator3 = page.locator("//div[@class='css-1tiis2k']");

    await expect(locator3).toContainText('Рекомендації');
  });
  test('Checking the display of goods for the selected location', async ({page}) => {
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
    const searchInput = page.locator("//input[@id='search']");
    await searchInput.fill('Телефон');
    const locationInput = page.locator("//input[@id='location-input']");
    await locationInput.fill('Харків, Харківська область');
    await page.locator("//div[@data-testid='suggestion-list']/li[1]").click();
    await page.locator("//button[@name='searchBtn']").click();
    await page.waitForTimeout(5000);
    const categoriesBreadcrumbs = page.locator(
      "//div[@data-testid='listing-grid']"
    );
    await expect(categoriesBreadcrumbs).toContainText('Харків');
  });
  test('Verify Sorting Options for Search Results', async ({ page }) => {
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
    await page.locator("//input[@data-testid='range-from-input']").fill('100');
    await page.locator("//input[@data-testid='range-to-input']").fill('100');

    await page
      .locator("(//div[@class='multi-select-head css-1ee1qo5'])[1]")
      .click();

    await page.locator("xpath=(//p[contains(text(),'Вживане')])").click();

    const filters = page.locator("//div[@data-testid='listing-grid']");
    await expect(filters).toContainText('100 грн.');
    await expect(filters).toContainText('Вживане');
  });
  test('Verify Pagination of Search Results', async ({ page }) => {
    await page.locator("//a[@data-testid='cat-37']").click();
    await page.locator("//a[@data-testid='sub-cat-37-root-link']").click();
    await page.locator("//li[@aria-label='Page 2']").click();
    await page.waitForURL('https://www.olx.ua/uk/elektronika/?page=2');
    expect(page.url()).toBe('https://www.olx.ua/uk/elektronika/?page=2');
  });
});
