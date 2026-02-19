import { expect } from '@playwright/test';
import { test } from '@playwright/test';
import * as path from 'node:path';

const FIXTURE_WITH_S06 = path.join(
    __dirname,
    'fixtures',
    'fixture-with-s06.json',
);
const FIXTURE_FIXED = path.join(__dirname, 'fixtures', 'fixture-fixed.json');

test.describe('E2E: полный цикл редактор → анализ → навигация к проблеме → исправление → повторный анализ', () => {
    test('редактор → анализ → S06 → навигация → импорт исправления → повторный анализ', async ({
        page,
    }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const fileInput = page.getByTestId('import-file-input');
        await fileInput.setInputFiles(FIXTURE_WITH_S06);

        await expect(
            page.getByRole('button', { name: 'Анализ' }),
        ).toBeEnabled({ timeout: 5000 });

        await page.getByRole('button', { name: 'Анализ' }).click();

        await expect(page).toHaveURL('/analysis');

        await expect(
            page.getByText('Результаты анализа', { exact: false }),
        ).toBeVisible({ timeout: 15_000 });

        const s06Title = page.getByText('Прямое обращение фронтенда к БД');
        await expect(s06Title).toBeVisible();

        const issueCard = page
            .getByRole('listitem')
            .filter({ hasText: 'Прямое обращение фронтенда к БД' });
        await issueCard.click();

        await expect(page).toHaveURL('/');

        await fileInput.setInputFiles(FIXTURE_FIXED);

        await expect(
            page.getByRole('button', { name: 'Анализ' }),
        ).toBeEnabled({ timeout: 5000 });

        await page.getByRole('button', { name: 'Анализ' }).click();

        await expect(page).toHaveURL('/analysis');

        await expect(
            page.getByText('Результаты анализа', { exact: false }),
        ).toBeVisible({ timeout: 15_000 });

        await expect(s06Title).not.toBeVisible();

        const metricsSection = page
            .getByRole('heading', { name: /метрики/i })
            .locator('../..');
        await expect(metricsSection).toContainText('4');
        await expect(metricsSection).toContainText('3');
    });
});
