import { expect, test, type Page } from '@playwright/test';

const HARS_DIR = 'tests/hars';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';
const MAIN_ID = '6acd6b8163765e96530bd9f0';
const MAIN_CALORIES = '4242';

const ORDER_NUMBER = '77777';
const USER_NAME = 'Тестовый пользователь';
const FAKE_ACCESS_TOKEN = 'Bearer fake-access-token';
const FAKE_REFRESH_TOKEN = 'fake-refresh-token';

const mockIngredients = async (page: Page): Promise<void> => {
  await page.routeFromHAR(`${HARS_DIR}/ingredients.har`, {
    url: '**/api/ingredients',
    notFound: 'abort',
  });
};

const openConstructorPage = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.getByText(BUN_NAME)).toBeVisible();
};

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await page
    .getByTestId('ingredients-content')
    .locator('li')
    .filter({ hasText: name })
    .getByRole('button', { name: 'Добавить' })
    .click();
};

test.describe('Добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredients(page);
    await openConstructorPage(page);
  });

  test('булка добавляется в верх и низ бургера', async ({ page }) => {
    await addIngredient(page, BUN_NAME);

    await expect(page.getByTestId('constructor-bun-1')).toContainText(
      `${BUN_NAME} (верх)`
    );
    await expect(page.getByTestId('constructor-bun-2')).toContainText(
      `${BUN_NAME} (низ)`
    );
  });

  test('начинка и соус добавляются в середину бургера', async ({ page }) => {
    const constructorIngredients = page.getByTestId('constructor-ingredients');

    await addIngredient(page, MAIN_NAME);
    await addIngredient(page, SAUCE_NAME);

    await expect(constructorIngredients).toContainText(MAIN_NAME);
    await expect(constructorIngredients).toContainText(SAUCE_NAME);
    await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0);
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredients(page);
    await openConstructorPage(page);
    await page
      .getByTestId('ingredients-content')
      .getByRole('link', { name: MAIN_NAME })
      .click();
  });

  test('открывается с данными ингредиента, по которому кликнули', async ({ page }) => {
    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Детали ингредиента');
    await expect(modal).toContainText(MAIN_NAME);
    await expect(modal).toContainText(MAIN_CALORIES);
    await expect(page).toHaveURL(`/ingredients/${MAIN_ID}`);
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await page.getByTestId('modal').getByRole('button', { name: 'Закрыть' }).click();

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await mockIngredients(page);
    await page.routeFromHAR(`${HARS_DIR}/user.har`, {
      url: '**/api/auth/user',
      notFound: 'abort',
    });
    await page.routeFromHAR(`${HARS_DIR}/order.har`, {
      url: '**/api/orders',
      notFound: 'abort',
    });

    await context.addCookies([
      {
        name: 'accessToken',
        value: encodeURIComponent(FAKE_ACCESS_TOKEN),
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.addInitScript((refreshToken: string) => {
      localStorage.setItem('refreshToken', refreshToken);
    }, FAKE_REFRESH_TOKEN);

    await openConstructorPage(page);
    await expect(page.getByText(USER_NAME)).toBeVisible();
  });

  test('заказ оформляется, а конструктор после этого очищается', async ({ page }) => {
    const burgerConstructor = page.getByTestId('constructor');

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN_NAME);
    await addIngredient(page, SAUCE_NAME);
    await expect(page.getByTestId('constructor-bun-1')).toBeVisible();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(ORDER_NUMBER);

    await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0);
    await expect(page.getByTestId('constructor-bun-2')).toHaveCount(0);
    await expect(burgerConstructor).toContainText('Выберите булки');
    await expect(burgerConstructor).toContainText('Выберите начинку');

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal).toHaveCount(0);
  });
});
