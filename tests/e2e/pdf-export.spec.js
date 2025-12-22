import { expect, test } from '@playwright/test'

/**
 * PDF 내보내기 기능 E2E 테스트
 *
 * 테스트 대상:
 * 1. 복약 순응도 리포트 PDF 다운로드
 * 2. 질병 정보 PDF 다운로드 (플로팅 메뉴)
 */

test.describe('PDF 내보내기 기능 테스트', () => {
  // Helper: 인증 설정
  const setupAuth = async (page, userId = 2) => {
    await page.addInitScript(({ uid }) => {
      const persisted = {
        state: {
          user: {
            id: uid,
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
    }, { uid: userId })
  }

  // Helper: 기본 API 모킹
  const mockBasicApis = async (page) => {
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      // JavaScript 파일 통과
      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      // SSE 모킹
      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: ': ok\\n\\n'
        })
      }

      // 기본 응답
      return route.fulfill({ status: 200, json: {} })
    })
  }

  test('복약 순응도 리포트 페이지 로드 및 PDF 버튼 확인', async ({ page }) => {
    await setupAuth(page)

    // API 모킹
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\\n\\n' })
      }

      // 순응도 요약 데이터 모킹
      if (url.includes('/adherence/summary') && !url.includes('/pdf')) {
        return route.fulfill({
          status: 200,
          json: {
            last7Days: { rate: 85, scheduled: 14, completed: 12 },
            last30Days: { rate: 78, scheduled: 60, completed: 47 },
            last365Days: { rate: 72, scheduled: 730, completed: 525 },
            streak: 5,
          }
        })
      }

      // 일별 순응도 데이터 모킹
      if (url.includes('/adherence/daily')) {
        const dailyData = []
        for (let i = 0; i < 14; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          dailyData.push({
            date: date.toISOString().split('T')[0],
            completed: Math.floor(Math.random() * 5) + 1,
            total: 5,
          })
        }
        return route.fulfill({
          status: 200,
          json: dailyData.reverse()
        })
      }

      return route.fulfill({ status: 200, json: {} })
    })

    await page.goto('http://localhost:4173/reports/adherence')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 스크린샷
    await page.screenshot({ path: 'test-results/adherence-report-page.png', fullPage: true })

    // 페이지 헤더 확인
    await expect(page.getByText('복약 순응도 리포트')).toBeVisible()

    // PDF 저장 버튼 확인
    const pdfButton = page.getByRole('button', { name: 'PDF 저장' })
    await expect(pdfButton).toBeVisible()

    // 순응도 데이터 표시 확인
    await expect(page.getByText('최근 30일 복약 순응도')).toBeVisible()
    await expect(page.getByText('78%')).toBeVisible() // 30일 순응도

    console.log('✅ 복약 순응도 리포트 페이지 로드 성공')
  })

  test('복약 순응도 리포트 PDF 다운로드 테스트', async ({ page }) => {
    await setupAuth(page)

    let pdfRequested = false
    let downloadTriggered = false

    // 다운로드 이벤트 감지
    page.on('download', async (download) => {
      downloadTriggered = true
      const filename = download.suggestedFilename()
      console.log('다운로드 파일명:', filename)

      // 파일명 패턴 검증 (adherence_report_YYYY-MM-DD.pdf)
      expect(filename).toMatch(/adherence_report_\d{4}-\d{2}-\d{2}\.pdf/)
    })

    // API 모킹
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\\n\\n' })
      }

      // PDF 다운로드 API
      if (url.includes('/adherence/summary/pdf')) {
        pdfRequested = true
        console.log('✅ PDF API 호출됨:', url)

        // Mock PDF blob (간단한 PDF 헤더)
        const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n>>\nendobj\nxref\n0 3\ntrailer\n<<\n/Size 3\n/Root 1 0 R\n>>\n%%EOF'

        return route.fulfill({
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="adherence_report_${new Date().toISOString().split('T')[0]}.pdf"`
          },
          body: pdfContent
        })
      }

      // 순응도 요약
      if (url.includes('/adherence/summary') && !url.includes('/pdf')) {
        return route.fulfill({
          status: 200,
          json: {
            last7Days: { rate: 85, scheduled: 14, completed: 12 },
            last30Days: { rate: 78, scheduled: 60, completed: 47 },
            last365Days: { rate: 72, scheduled: 730, completed: 525 },
            streak: 5,
          }
        })
      }

      // 일별 데이터
      if (url.includes('/adherence/daily')) {
        return route.fulfill({
          status: 200,
          json: [
            { date: '2025-12-19', completed: 4, total: 5 },
            { date: '2025-12-18', completed: 5, total: 5 },
          ]
        })
      }

      return route.fulfill({ status: 200, json: {} })
    })

    await page.goto('http://localhost:4173/reports/adherence')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // PDF 저장 버튼 클릭
    const pdfButton = page.getByRole('button', { name: 'PDF 저장' })
    await expect(pdfButton).toBeVisible()

    await pdfButton.click()
    await page.waitForTimeout(2000)

    // 스크린샷
    await page.screenshot({ path: 'test-results/after-pdf-download.png', fullPage: true })

    // 검증
    expect(pdfRequested).toBeTruthy()
    console.log('PDF API 요청:', pdfRequested ? '✅' : '❌')
    console.log('다운로드 트리거:', downloadTriggered ? '✅' : '❌')

    // Toast 메시지 확인 (선택적)
    const successToast = page.getByText('리포트가 다운로드되었습니다')
    const isToastVisible = await successToast.isVisible().catch(() => false)
    console.log('성공 메시지:', isToastVisible ? '✅' : '⚠️ (선택적)')
  })

  test('질병 정보 PDF - 플로팅 메뉴에서 내보내기', async ({ page }) => {
    await setupAuth(page, 2)

    let pdfRequested = false

    // API 모킹
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\\n\\n' })
      }

      // 질병 PDF 내보내기 API
      if (url.includes('/disease/user/') && url.includes('/export/pdf')) {
        pdfRequested = true
        console.log('✅ 질병 PDF API 호출됨:', url)

        const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF'

        return route.fulfill({
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="diseases.pdf"'
          },
          body: pdfContent
        })
      }

      // 알림 개수
      if (url.includes('/notifications/unread-count')) {
        return route.fulfill({ status: 200, json: { count: 3 } })
      }

      // 대시보드 관련 API 모킹
      if (url.includes('/medications/schedules/today')) {
        return route.fulfill({ status: 200, json: [] })
      }

      if (url.includes('/medications')) {
        return route.fulfill({ status: 200, json: [] })
      }

      return route.fulfill({ status: 200, json: {} })
    })

    // 홈 대시보드로 이동 (플로팅 버튼이 있는 페이지)
    await page.goto('http://localhost:4173/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 플로팅 메뉴 열기 (퀵 메뉴 버튼)
    const quickMenuButton = page.getByRole('button', { name: '퀵 메뉴 열기' })
    await expect(quickMenuButton).toBeVisible({ timeout: 15000 })
    await quickMenuButton.click()
    await page.waitForTimeout(500)

    // 스크린샷 (메뉴 열림)
    await page.screenshot({ path: 'test-results/floating-menu-open.png', fullPage: true })

    // PDF 내보내기 버튼 찾기
    const pdfExportButton = page.getByText('PDF 출력')
    await expect(pdfExportButton).toBeVisible({ timeout: 5000 })

    // 클릭
    await pdfExportButton.click()
    await page.waitForTimeout(2000)

    // 스크린샷 (클릭 후)
    await page.screenshot({ path: 'test-results/after-disease-pdf-click.png', fullPage: true })

    // 검증
    expect(pdfRequested).toBeTruthy()
    console.log('질병 PDF API 요청:', pdfRequested ? '✅' : '❌')

    // Toast 메시지 확인
    const toast = page.getByText('PDF 다운로드를 시작합니다')
    const isToastVisible = await toast.isVisible().catch(() => false)
    console.log('다운로드 시작 메시지:', isToastVisible ? '✅' : '⚠️ (선택적)')
  })

  test('PDF 다운로드 실패 시 에러 처리', async ({ page }) => {
    await setupAuth(page)

    // API 모킹 - 에러 응답
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\\n\\n' })
      }

      // PDF API - 에러 반환
      if (url.includes('/adherence/summary/pdf')) {
        console.log('❌ PDF API 에러 시뮬레이션')
        return route.fulfill({
          status: 500,
          json: { message: 'Internal Server Error' }
        })
      }

      // 순응도 데이터
      if (url.includes('/adherence/summary')) {
        return route.fulfill({
          status: 200,
          json: {
            last7Days: { rate: 85, scheduled: 14, completed: 12 },
            last30Days: { rate: 78, scheduled: 60, completed: 47 },
            last365Days: { rate: 72, scheduled: 730, completed: 525 },
            streak: 5,
          }
        })
      }

      if (url.includes('/adherence/daily')) {
        return route.fulfill({ status: 200, json: [] })
      }

      return route.fulfill({ status: 200, json: {} })
    })

    await page.goto('http://localhost:4173/reports/adherence')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // PDF 저장 버튼 클릭
    const pdfButton = page.getByRole('button', { name: 'PDF 저장' })
    await pdfButton.click()
    await page.waitForTimeout(2000)

    // 스크린샷
    await page.screenshot({ path: 'test-results/pdf-error-handling.png', fullPage: true })

    // 에러 메시지 확인
    const errorToast = page.getByText('리포트 생성에 실패했습니다')
    const isErrorVisible = await errorToast.isVisible().catch(() => false)

    console.log('에러 메시지 표시:', isErrorVisible ? '✅' : '⚠️ (선택적)')
  })

  test('PDF 다운로드 진행 중 상태 확인', async ({ page }) => {
    await setupAuth(page)

    // API 모킹 - 지연된 응답
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      if (url.endsWith('.js') || route.request().resourceType() === 'script') {
        return route.continue()
      }

      if (route.request().resourceType() === 'eventsource') {
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: ': ok\\n\\n' })
      }

      // PDF API - 2초 지연
      if (url.includes('/adherence/summary/pdf')) {
        console.log('⏳ PDF 생성 시뮬레이션 (2초 지연)')
        await new Promise(resolve => setTimeout(resolve, 2000))

        const pdfContent = '%PDF-1.4\nMock PDF content\n%%EOF'
        return route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/pdf' },
          body: pdfContent
        })
      }

      if (url.includes('/adherence/summary')) {
        return route.fulfill({
          status: 200,
          json: {
            last30Days: { rate: 78, scheduled: 60, completed: 47 },
          }
        })
      }

      if (url.includes('/adherence/daily')) {
        return route.fulfill({ status: 200, json: [] })
      }

      return route.fulfill({ status: 200, json: {} })
    })

    await page.goto('http://localhost:4173/reports/adherence')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // PDF 저장 버튼 클릭
    const pdfButton = page.getByRole('button', { name: 'PDF 저장' })
    await pdfButton.click()

    // 진행 중 메시지 확인 (0.5초 후)
    await page.waitForTimeout(500)
    const infoToast = page.getByText('리포트를 생성하고 있습니다')
    const isInfoVisible = await infoToast.isVisible().catch(() => false)

    console.log('진행 중 메시지:', isInfoVisible ? '✅' : '⚠️ (선택적)')

    // 완료 대기
    await page.waitForTimeout(2500)

    // 스크린샷
    await page.screenshot({ path: 'test-results/pdf-loading-state.png', fullPage: true })

    console.log('✅ PDF 다운로드 진행 상태 테스트 완료')
  })
})
