import { expect, test } from '@playwright/test'
import { setE2EAuth } from './utils/e2eSetup'
import { ensureGeneralNotificationsOpen, setMobileViewport } from './utils/notificationTestUtils'

/**
 * 알림 무한스크롤 테스트
 *
 * 테스트 시나리오:
 * 1. 초기 로드 시 첫 페이지(20개) 표시
 * 2. 스크롤 하단 도달 시 다음 페이지 자동 로드
 * 3. 로딩 스피너 표시
 * 4. 모든 데이터 로드 후 종료 메시지 표시
 * 5. 에러 발생 시 재시도 버튼 표시
 */

// 기본 API 모킹 설정
const setupBasicRoutes = async (page) => {
  const handledRequests = []

  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    const resourceType = request.resourceType()
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
    const isApiRequest =
      (resourceType === 'xhr' || resourceType === 'fetch' || resourceType === 'eventsource') &&
      normalizedPath.startsWith('/api/')

    if (!isApiRequest) {
      return route.continue()
    }

    handledRequests.push({ method, path: normalizedPath, resourceType })

    // SSE 구독
    if (resourceType === 'eventsource' && path.includes('/notifications/subscribe')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: ': ok\n\n',
      })
    }

    if (method === 'GET' && normalizedPath.endsWith('/notifications/unread-count')) {
      return route.fulfill({ status: 200, json: 0 })
    }

    // notifications API는 각 테스트에서 개별 처리하므로 제외
    if (normalizedPath.startsWith('/api/notifications') && !normalizedPath.endsWith('/subscribe')) {
      return route.fallback()
    }

    // 기타 필수 API (빈 응답)
    if (method === 'GET' && normalizedPath.endsWith('/family/groups')) {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath.startsWith('/api/family/invites')) {
      return route.fulfill({ status: 200, json: [] })
    }

    if (method === 'GET' && normalizedPath.startsWith('/api/medications')) {
      return route.fulfill({ status: 200, json: [] })
    }

    // 나머지 API는 기본 응답
    return route.fulfill({ status: 200, json: {} })
  })

  return handledRequests
}

// 테스트용 알림 데이터 생성 함수
const generateNotifications = (page, size, pageNumber) => {
  const notifications = []
  const offset = page * size

  for (let i = 0; i < size; i++) {
    const index = offset + i
    notifications.push({
      id: `notif-${index}`,
      title: `알림 제목 ${index + 1}`,
      message: `알림 내용 ${index + 1} - 페이지 ${page + 1}`,
      type: 'GENERAL',
      read: false,
      createdAt: new Date(Date.now() - index * 60000).toISOString(),
    })
  }

  return notifications
}

// 페이지네이션 응답 생성 함수
const createPageResponse = (content, page, size, totalElements) => {
  const totalPages = Math.ceil(totalElements / size)
  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size,
      offset: page * size,
    },
    totalElements,
    totalPages,
    size,
    number: page,
    numberOfElements: content.length,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  }
}

test.describe.skip('알림 무한스크롤', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await setE2EAuth(page, { customerRole: 'SENIOR' })
    await setupBasicRoutes(page)
  })

  test('초기 로드 시 첫 페이지(20개) 알림 표시', async ({ page }) => {
    const PAGE_SIZE = 20
    const TOTAL_ELEMENTS = 50

    await page.route('**/api/notifications**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const path = url.pathname
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
      const resourceType = request.resourceType()

      // notifications API만 처리
      if (resourceType === 'eventsource') {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: ': ok\n\n',
        })
      }

      if (normalizedPath.endsWith('/api/notifications/unread-count')) {
        return route.fulfill({ status: 200, json: 0 })
      }

      if (!normalizedPath.endsWith('/api/notifications')) {
        return route.fallback()
      }

      const pageParam = parseInt(url.searchParams.get('page') || '0', 10)
      const sizeParam = parseInt(url.searchParams.get('size') || '20', 10)

      const notifications = generateNotifications(pageParam, sizeParam, pageParam)
      const response = createPageResponse(notifications, pageParam, sizeParam, TOTAL_ELEMENTS)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')

    // 페이지 헤더 확인
    await expect(page.getByRole('heading', { name: '알림' })).toBeVisible()

    // 초기 20개 알림 로드 대기
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 첫 번째 알림 확인
    await expect(page.getByText('알림 제목 1', { exact: true })).toBeVisible()

    // 마지막(20번째) 알림 확인
    await expect(page.getByText('알림 제목 20', { exact: true })).toBeVisible()

    // 추가 로드가 자동으로 발생할 수 있어 21번째 알림 여부는 검증하지 않음
  })

  test('스크롤 하단 도달 시 자동으로 다음 페이지 로드', async ({ page }) => {
    const PAGE_SIZE = 20
    const TOTAL_ELEMENTS = 50
    const requestedPages = new Set()

    await page.route('**/api/notifications**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const path = url.pathname
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
      const resourceType = request.resourceType()

      if (resourceType === 'eventsource') {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: ': ok\n\n',
        })
      }

      if (normalizedPath.endsWith('/api/notifications/unread-count')) {
        return route.fulfill({ status: 200, json: 0 })
      }

      if (!normalizedPath.endsWith('/api/notifications')) {
        return route.fallback()
      }

      const pageParam = parseInt(url.searchParams.get('page') || '0', 10)
      const sizeParam = parseInt(url.searchParams.get('size') || '20', 10)

      requestedPages.add(pageParam)

      const notifications = generateNotifications(pageParam, sizeParam, pageParam)
      const response = createPageResponse(notifications, pageParam, sizeParam, TOTAL_ELEMENTS)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 초기 요청 확인
    await expect.poll(() => requestedPages.has(0)).toBe(true)

    // 페이지 하단으로 스크롤
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // 다음 페이지 로드 대기
    await page.waitForTimeout(2000)

    // 두 번째 페이지 요청 확인
    await expect.poll(() => requestedPages.has(1)).toBe(true)

    // 21번째 알림(두 번째 페이지의 첫 번째) 확인
    await expect(page.getByText('알림 제목 21', { exact: true })).toBeVisible()

    // 40번째 알림(두 번째 페이지의 마지막) 확인
    await expect(page.getByText('알림 제목 40', { exact: true })).toBeVisible()
  })

  test('모든 데이터 로드 후 종료 메시지 표시', async ({ page }) => {
    const PAGE_SIZE = 20
    const TOTAL_ELEMENTS = 25 // 2페이지만 존재

    await page.route('**/api/notifications**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const path = url.pathname
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
      const resourceType = request.resourceType()

      if (resourceType === 'eventsource') {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: ': ok\n\n',
        })
      }

      if (normalizedPath.endsWith('/api/notifications/unread-count')) {
        return route.fulfill({ status: 200, json: 0 })
      }

      if (!normalizedPath.endsWith('/api/notifications')) {
        return route.fallback()
      }

      const pageParam = parseInt(url.searchParams.get('page') || '0', 10)
      const sizeParam = parseInt(url.searchParams.get('size') || '20', 10)

      const notifications = generateNotifications(pageParam, sizeParam, pageParam)
      const response = createPageResponse(notifications, pageParam, sizeParam, TOTAL_ELEMENTS)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 첫 페이지 하단으로 스크롤
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // 두 번째 페이지 로드 대기
    await page.waitForTimeout(2000)
    await expect(page.getByText('알림 제목 21')).toBeVisible()

    // 다시 하단으로 스크롤
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    await page.waitForTimeout(1500)

    // 종료 메시지 확인
    await expect(page.getByText('더 이상 알림이 없습니다')).toBeVisible()
  })

  test('로드 실패 시 재시도 버튼 표시', async ({ page }) => {
    let shouldFail = true
    let failedPageRequest = false

    await page.route('**/api/notifications**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const path = url.pathname
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
      const resourceType = request.resourceType()

      if (resourceType === 'eventsource') {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: ': ok\n\n',
        })
      }

      if (normalizedPath.endsWith('/api/notifications/unread-count')) {
        return route.fulfill({ status: 200, json: 0 })
      }

      if (!normalizedPath.endsWith('/api/notifications')) {
        return route.fallback()
      }

      const pageParam = parseInt(url.searchParams.get('page') || '0', 10)
      const sizeParam = parseInt(url.searchParams.get('size') || '20', 10)

      // 두 번째 페이지 요청 시 에러 발생
      if (pageParam === 1 && shouldFail) {
        failedPageRequest = true
        await route.abort('failed')
        return
      }

      const notifications = generateNotifications(pageParam, sizeParam, pageParam)
      const response = createPageResponse(notifications, pageParam, sizeParam, 50)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 하단으로 스크롤하여 두 번째 페이지 로드 시도
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    await page.waitForTimeout(2000)

    await expect.poll(() => failedPageRequest).toBe(true)

    // 에러 메시지 및 재시도 버튼 확인
    await expect(page.getByText('로드 실패, 다시 시도')).toBeVisible()
    await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible()

    // 에러 플래그 해제
    shouldFail = false

    // 재시도 버튼 클릭
    await page.getByRole('button', { name: '다시 시도' }).click()

    // 성공적으로 로드됨 확인
    await page.waitForTimeout(2000)
    await expect(page.getByText('알림 제목 21', { exact: true })).toBeVisible()
  })

  test('중요 알림과 일반 알림 분리 표시 확인', async ({ page }) => {
    await page.route('**/api/notifications**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const path = url.pathname
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
      const resourceType = request.resourceType()

      if (resourceType === 'eventsource') {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: ': ok\n\n',
        })
      }

      if (normalizedPath.endsWith('/api/notifications/unread-count')) {
        return route.fulfill({ status: 200, json: 0 })
      }

      if (!normalizedPath.endsWith('/api/notifications')) {
        return route.fallback()
      }

      const pageParam = parseInt(url.searchParams.get('page') || '0', 10)

      const notifications = [
        {
          id: 'missed-1',
          title: '복약 미준수',
          message: '09:00 예정 타이레놀 복용을 아직 하지 않았습니다.',
          type: 'MEDICATION_MISSED',
          read: false,
          createdAt: new Date().toISOString(),
          scheduledTime: '09:00',
          missedMedications: [{ medicationId: 1, medicationName: '타이레놀' }],
          missedCount: 1,
        },
        {
          id: 'general-1',
          title: '일반 알림',
          message: '일반 알림 내용입니다.',
          type: 'GENERAL',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]

      const response = createPageResponse(notifications, pageParam, 20, 2)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await ensureGeneralNotificationsOpen(page)

    // 중요 알림 섹션 확인
    await expect(page.getByRole('button', { name: /^중요 알림\s*\d+개$/ })).toBeVisible()

    // 일반 알림 섹션 확인
    await expect(page.getByRole('button', { name: /^일반 알림\s*\d+개$/ })).toBeVisible()

    // 복약 미준수 알림 확인
    await expect(page.getByText('복약 미준수')).toBeVisible()
  })

  test('빈 알림 목록 처리', async ({ page }) => {
    await page.route('**/api/notifications**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const path = url.pathname
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
      const resourceType = request.resourceType()

      if (resourceType === 'eventsource') {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: ': ok\n\n',
        })
      }

      if (!normalizedPath.endsWith('/api/notifications')) {
        return route.fallback()
      }

      const response = createPageResponse([], 0, 20, 0)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      })
    })

    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 빈 상태 메시지 확인
    await expect(page.getByText('새로운 알림이 없습니다')).toBeVisible()
  })
})
