import { test, expect } from '@playwright/test';

test.describe('Fix Verifications', () => {

  test('Login should clear localStorage/sessionStorage', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('old_user_data', 'dirty');
      sessionStorage.setItem('old_session_data', 'dirty');
    });

    const val = await page.evaluate(() => localStorage.getItem('old_user_data'));
    expect(val).toBe('dirty');

    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          user: { id: 1, email: 'test@example.com', name: 'Test User', customerRole: 'CAREGIVER' }
        })
      });
    });
    
    await page.route('**/api/users/me', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    const newVal = await page.evaluate(() => localStorage.getItem('old_user_data'));
    const newSessionVal = await page.evaluate(() => sessionStorage.getItem('old_session_data'));

    expect(newVal).toBeNull();
    expect(newSessionVal).toBeNull();
  });

  test('GroupSelectionModal should have dark backdrop', async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                token: 'test-token',
                refreshToken: 'test-refresh-token',
                user: { id: 1, customerRole: 'CAREGIVER', name: 'Tester' }
            })
        });
    });

    await page.route('**/api/family/groups', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Family A', members: [], createdBy: 1, ownerId: 1 },
                { id: 2, name: 'Family B', members: [], createdBy: 1, ownerId: 1 }
            ])
        });
    });

    await page.route('**/api/chat/unread/**', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({ count: 0 }) });
    });
    
    await page.route('**/api/family/invites**', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });

    await page.goto('/login');
    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    await page.waitForURL(/caregiver/);
    await page.goto('/family');

    // Wait for page to be ready
    await expect(page.getByRole('heading', { name: '가족 관리' })).toBeVisible({ timeout: 10000 });

    // Open the modal manually to ensure we test the backdrop
    await page.getByRole('button', { name: /그룹 변경/ }).click();

    const modalTitle = page.getByText('가족 그룹 선택');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });

    const backdrop = page.locator('.MuiBackdrop-root').first();
    await expect(backdrop).toBeVisible();

    const backgroundColor = await backdrop.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
    });

    expect(backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
  });

});
