import { expect, test } from '@playwright/test'

const setE2EAuth = async (page, { customerRole }) => {
  const user = {
    id: 1,
    name: 'E2E 사용자',
    email: 'e2e@example.com',
    customerRole,
    userRole: 'ROLE_USER',
  }

  const persisted = {
    state: {
      user,
      token: 'e2e-token',
      refreshToken: null,
      userRole: user.userRole,
      customerRole: user.customerRole,
    },
    version: 0,
  }

  await page.addInitScript(
    ({ persistedState, rawUser, customerRoleValue }) => {
      localStorage.setItem('amapill-auth-storage-v2', JSON.stringify(persistedState))
      localStorage.setItem('amapill_token', persistedState.state.token)
      localStorage.setItem('amapill_user', JSON.stringify(rawUser))
      localStorage.setItem('amapill_role', customerRoleValue)
    },
    { persistedState: persisted, rawUser: user, customerRoleValue: customerRole },
  )

  await page.addInitScript(() => {
    class MockEventSource {
      static OPEN = 1
      readyState = MockEventSource.OPEN

      onopen = null
      onerror = null

      constructor() {
        setTimeout(() => this.onopen?.(), 0)
      }

      close() {}
      addEventListener() {}
    }

    window.EventSource = MockEventSource
  })
}

const mockApi = async (page) => {
  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
    const method = request.method()
    const resourceType = request.resourceType()

    const isApiRequest =
      (resourceType === 'xhr' || resourceType === 'fetch' || resourceType === 'eventsource') &&
      normalizedPath.startsWith('/api/')
    if (!isApiRequest) {
      return route.continue()
    }

    if (resourceType === 'eventsource' && normalizedPath === '/api/notifications/subscribe') {
      return route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: ': ok\n\n',
      })
    }

    if (method === 'GET' && normalizedPath === '/api/notifications') {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath === '/api/medications') {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath === '/api/medications/today') {
      return route.fulfill({ status: 200, json: { schedules: [] } })
    }

    if (method === 'GET' && normalizedPath === '/api/medications/logs') {
      return route.fulfill({ status: 200, json: [] })
    }

    return route.fulfill({ status: 200, json: {} })
  })
}

test.describe('스모크(시니어)', () => {
  test.beforeEach(async ({ page }) => {
    await setE2EAuth(page, { customerRole: 'SENIOR' })
    await mockApi(page)
  })

  test('대시보드 기본 렌더 + 확대모드 기본 ON', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: '오늘의 복용' })).toBeVisible()

    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('18px')
  })

  test('설정에서 확대모드 토글 OFF', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: '설정' })).toBeVisible()

    const toggle = page.getByLabel('확대 모드')
    await expect(toggle).toBeChecked()

    await toggle.click()

    await expect.poll(async () => {
      return page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
    }).toBe('16px')

    const stored = await page.evaluate(() => localStorage.getItem('amapill-ui-preferences-v1'))
    expect(stored).toContain('"accessibilityMode":false')
  })
})
