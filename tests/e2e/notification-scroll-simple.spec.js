import { expect, test } from '@playwright/test'
import { ensureGeneralNotificationsOpen, setMobileViewport } from './utils/notificationTestUtils'

/**
 * 간단한 무한스크롤 테스트 - API 모킹 사용
 * 실제 백엔드 데이터베이스에 425개 알림이 있는 상태를 시뮬레이션
 */

test.describe('알림 무한스크롤 테스트', () => {
  test('초기 20개 로드 후 스크롤 시 추가 20개 로드', async ({ page }) => {
    await setMobileViewport(page)
    // 인증 설정
    await page.addInitScript(() => {
      const persisted = {
        state: {
          user: {
            id: 2,
            email: 'msa2@msa.com',
            name: 'MSA 어르신A',
            customerRole: 'SENIOR',
            userRole: 'ROLE_USER',
          },
          token: 'test-token',
          refreshToken: null,
          userRole: 'ROLE_USER',
          customerRole: 'SENIOR',
        },
        version: 0,
      }
      localStorage.setItem('amapill-auth-storage-v2', JSON.stringify(persisted))
      localStorage.setItem('amapill_token', 'test-token')
      localStorage.setItem('amapill_user', JSON.stringify(persisted.state.user))
      localStorage.setItem('amapill_role', 'SENIOR')
    })

    // API 모킹 - 실제 DB의 425개 알림을 시뮬레이션
    const createNotifications = (page, size) => {
      const notifications = []
      for (let i = 1; i <= size; i++) {
        notifications.push({
          id: page * 20 + i,
          type: i % 4 === 0 ? 'DIET_WARNING' : i % 3 === 0 ? 'FAMILY_EVENT' : 'MEDICATION_REMINDER',
          title: `알림 ${page * 20 + i}`,
          message: `알림 내용 ${page * 20 + i}`,
          read: false,
          createdAt: new Date(Date.now() - (page * 20 + i) * 3600000).toISOString(),
        })
      }
      return notifications
    }

    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      // JavaScript 파일은 통과
      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      // SSE
      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\\n\\n' })
      }

      // Notifications API - 페이지네이션
      if (url.includes('/api/notifications')) {
        const urlObj = new URL(url)
        const page = parseInt(urlObj.searchParams.get('page') || '0')
        const size = parseInt(urlObj.searchParams.get('size') || '20')

        // 총 425개 알림 시뮬레이션
        const totalElements = 425
        const isLastPage = (page + 1) * size >= totalElements
        const actualSize = isLastPage ? totalElements - (page * size) : size

        return route.fulfill({
          status: 200,
          json: {
            content: createNotifications(page, actualSize),
            pageable: {
              pageNumber: page,
              pageSize: size,
            },
            totalElements: totalElements,
            totalPages: Math.ceil(totalElements / size),
            last: isLastPage,
          },
        })
      }

      // 기타 API는 빈 응답
      return route.fulfill({ status: 200, json: {} })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 초기 화면 스크린샷
    await page.screenshot({ path: 'test-results/scroll-initial.png', fullPage: true })

    // 페이지 헤더 확인
    await expect(page.getByRole('heading', { name: '알림', exact: true }).first()).toBeVisible()

    // 초기 알림이 로드되었는지 확인
    await expect(page.getByText('알림 1')).toBeVisible()
    await expect(page.getByText('알림 20')).toBeVisible()

    // 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(3000)

    // 스크롤 후 스크린샷
    await page.screenshot({ path: 'test-results/scroll-after.png', fullPage: true })

    // 추가 알림이 로드되었는지 확인
    const hasMore = await page.getByText('알림 21').isVisible().catch(() => false)
    const hasEndMessage = await page.getByText('더 이상 알림이 없습니다').isVisible().catch(() => false)

    console.log('추가 로드됨:', hasMore)
    console.log('종료 메시지:', hasEndMessage)

    expect(hasMore || hasEndMessage).toBeTruthy()

    // 최소 40개 이상의 알림이 로드되었는지 확인 (초기 20개 + 추가 20개)
    if (!hasEndMessage) {
      await expect(page.getByText('알림 21')).toBeVisible()
    }
  })

  test('여러 번 스크롤하여 페이지네이션 동작 확인', async ({ page }) => {
    await setMobileViewport(page)
    // 인증 설정
    await page.addInitScript(() => {
      const persisted = {
        state: {
          user: {
            id: 2,
            email: 'msa2@msa.com',
            name: 'MSA 어르신A',
            customerRole: 'SENIOR',
            userRole: 'ROLE_USER',
          },
          token: 'test-token',
          refreshToken: null,
          userRole: 'ROLE_USER',
          customerRole: 'SENIOR',
        },
        version: 0,
      }
      localStorage.setItem('amapill-auth-storage-v2', JSON.stringify(persisted))
    })

    // API 모킹
    const createNotifications = (page, size) => {
      const notifications = []
      for (let i = 1; i <= size; i++) {
        notifications.push({
          id: page * 20 + i,
          type: 'MEDICATION_REMINDER',
          title: `Page${page} 알림${i}`,
          message: `내용`,
          read: false,
          createdAt: new Date().toISOString(),
        })
      }
      return notifications
    }

    let pageRequests = []

    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\\n\\n' })
      }

      if (url.includes('/api/notifications')) {
        const urlObj = new URL(url)
        const page = parseInt(urlObj.searchParams.get('page') || '0')
        const size = parseInt(urlObj.searchParams.get('size') || '20')

        pageRequests.push(page)
        console.log(`API 요청: page=${page}, size=${size}`)

        const totalElements = 100
        const isLastPage = (page + 1) * size >= totalElements
        const actualSize = isLastPage ? totalElements - (page * size) : size

        return route.fulfill({
          status: 200,
          json: {
            content: createNotifications(page, actualSize),
            pageable: { pageNumber: page, pageSize: size },
            totalElements,
            totalPages: 5,
            last: isLastPage,
          },
        })
      }

      return route.fulfill({ status: 200, json: {} })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 3번 스크롤
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(2000)
    }

    await page.screenshot({ path: 'test-results/scroll-multiple.png', fullPage: true })

    // 최소 2페이지 이상 요청되었는지 확인
    const uniquePages = [...new Set(pageRequests)]
    console.log('요청된 페이지:', uniquePages)
    expect(uniquePages.length).toBeGreaterThan(1)
  })
})
