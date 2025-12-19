import { expect, test } from '@playwright/test'

test.describe('알림 읽지 않은 개수 테스트', () => {
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
        },
        version: 0,
      }
      localStorage.setItem('amapill-auth-storage-v2', JSON.stringify(persisted))
      localStorage.setItem('amapill_token', 'test-token')
    }, { uid: userId })
  }

  test('알림 페이지에서 읽지 않은 개수가 서버 데이터와 일치하는지 확인', async ({ page }) => {
    await setupAuth(page)

    // API 모킹
    page.on('request', request => console.log('>>', request.method(), request.url()))
    page.on('response', response => console.log('<<', response.status(), response.url()))

    await page.route('**/api/notifications/unread-count*', async (route) => {
      return route.fulfill({
        status: 200,
        json: 15 // 전체 읽지 않은 개수는 15개라고 가정
      })
    })

    await page.route(/\/api\/notifications(?!\/unread-count)/, async (route) => {
      const url = route.request().url()
      const pageNum = new URL(url).searchParams.get('page') || '0'
      
      // 첫 페이지는 5개 알림 (3개 읽음, 2개 안읽음)
      if (pageNum === '0') {
        return route.fulfill({
          status: 200,
          json: {
            content: Array.from({ length: 5 }, (_, i) => ({
              id: i + 1,
              title: `알림 ${i + 1}`,
              message: `메시지 ${i + 1}`,
              read: i >= 2, // 0, 1은 안읽음 (2개)
              createdAt: new Date().toISOString(),
              type: 'NORMAL'
            })),
            last: false,
            totalElements: 100
          }
        })
      }
      
      // 두 번째 페이지 (모두 안읽음)
      return route.fulfill({
        status: 200,
        json: {
          content: Array.from({ length: 5 }, (_, i) => ({
            id: i + 6,
            title: `알림 ${i + 6}`,
            message: `메시지 ${i + 6}`,
            read: false, // 모두 안읽음
            createdAt: new Date().toISOString(),
            type: 'NORMAL'
          })),
          last: true,
          totalElements: 100
        }
      })
    })

    // 알림 페이지로 이동
    console.log('알림 페이지로 이동 중...')
    await page.goto('http://localhost:4173/notifications')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // 렌더링 대기
    
    await page.screenshot({ path: 'test-results/notification-page-debug.png', fullPage: true })
    const bodyText = await page.innerText('body')
    console.log('페이지 전체 텍스트 일부:', bodyText.substring(0, 500))

    // 현재 읽지 않은 개수 확인 (서버에서 가져온 15여야 함)
    const unreadTextContent = page.getByText(/읽지 않음/).first()
    await expect(unreadTextContent).toBeVisible({ timeout: 10000 })
    
    console.log('초기 알림 개수 확인 중...')
    const text = await unreadTextContent.textContent()
    console.log('화면에 표시된 텍스트:', text)
    expect(text).toContain('15')
    
    // 무한 스크롤 발생을 위해 아래로 스크롤
    await page.evaluate(() => {
      const scrollable = document.querySelector('.MuiPaper-root') || window
      scrollable.scrollTo(0, 10000)
    })
    await page.waitForTimeout(2000)
    
    const textAfterScroll = await unreadTextContent.textContent()
    console.log('스크롤 후 표시된 텍스트:', textAfterScroll)
    expect(textAfterScroll).toContain('15') // 개수가 변하지 않아야 함
    
    console.log('✅ 안읽은 알림 개수가 무한 스크롤 시에도 유지됨 확인')
  })
})
