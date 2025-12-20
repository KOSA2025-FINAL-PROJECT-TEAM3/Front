import { expect, test } from '@playwright/test'
import { setE2EAuth } from './utils/e2eSetup'
import { ensureGeneralNotificationsOpen } from './utils/notificationTestUtils'

test('알림 20개 표시 확인', async ({ page }) => {
  await setE2EAuth(page, { customerRole: 'SENIOR' })

  // 요청 로깅
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      console.log('→ REQUEST:', req.method(), req.url())
    }
  })

  page.on('response', (res) => {
    if (res.url().includes('/api/')) {
      console.log('← RESPONSE:', res.status(), res.url())
    }
  })

  page.on('console', (msg) => console.log('CONSOLE:', msg.text()))
  page.on('pageerror', (err) => console.log('ERROR:', err.message))

  // API 모킹 (JavaScript 파일 제외!)
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname

    // JavaScript 파일은 통과
    if (path.endsWith('.js') || route.request().resourceType() === 'script') {
      return route.continue()
    }

    // SSE
    if (route.request().resourceType() === 'eventsource') {
      return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\n\n' })
    }

    // Notifications - 페이지네이션 응답
    if (path.includes('/api/notifications')) {
      const notifications = []
      for (let i = 1; i <= 20; i++) {
        notifications.push({
          id: i,
          title: `알림${i}`,
          message: `내용${i}`,
          type: 'GENERAL',
          read: false,
          createdAt: new Date().toISOString(),
        })
      }
      return route.fulfill({
        status: 200,
        json: { content: notifications, totalElements: 20, last: true },
      })
    }

    // 나머지 API
    return route.fulfill({ status: 200, json: [] })
  })

  await page.goto('/notifications')

  // 네트워크 idle 대기
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await page.waitForTimeout(3000)
  await ensureGeneralNotificationsOpen(page)

  // notifications API 호출 대기
  console.log('Waiting for notifications API...')
  await page.waitForTimeout(3000)

  // 확인
  await expect(page.getByText('알림1')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('알림20')).toBeVisible()
})
