import { test, expect } from '@playwright/test';

test('navegação básica', async ({ page }) => {
  const base = process.env.VITE_BASE_URL || 'http://localhost:3000';
  await page.goto(base);
  await expect(page.getByText('Previsão do Tempo')).toBeVisible();

  // Ir para Histórico (espera redirecionar para login se não autenticado)
  await page.getByRole('link', { name: 'Histórico' }).click();
  await expect(page.getByText(/Login/i)).toBeVisible();
});


