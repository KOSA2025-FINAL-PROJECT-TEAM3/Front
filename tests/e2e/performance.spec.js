/**
 * 프론트엔드 성능 측정 테스트
 * - 페이지 로딩 시간
 * - Web Vitals (FCP, LCP)
 * - Navigation Timing API
 */

import { test, expect } from '@playwright/test'
import { setE2EAuth } from './utils/e2eSetup'

const PERFORMANCE_THRESHOLDS = {
    pageLoad: 3000,        // 페이지 로딩 3초 이하
    fcp: 1800,             // First Contentful Paint 1.8초 이하
    lcp: 2500,             // Largest Contentful Paint 2.5초 이하
    domContentLoaded: 2000 // DOM Content Loaded 2초 이하
}

test.describe('Performance Measurements', () => {
    test.beforeEach(async ({ page }) => {
        // 시니어 사용자로 인증 설정
        await setE2EAuth(page, { role: 'SENIOR', userId: 'perf-test-user' })
    })

    test('Senior Dashboard 초기 로딩 성능 측정', async ({ page }) => {
        const startTime = Date.now()

        // 대시보드 이동
        await page.goto('/dashboard', { waitUntil: 'networkidle' })

        const endTime = Date.now()
        const totalLoadTime = endTime - startTime

        // Navigation Timing API로 상세 측정
        const performanceMetrics = await page.evaluate(() => {
            const timing = performance.timing
            const navigation = performance.getEntriesByType('navigation')[0]

            return {
                // Navigation Timing
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                pageLoad: timing.loadEventEnd - timing.navigationStart,
                domInteractive: timing.domInteractive - timing.navigationStart,

                // Resource Timing
                resourceCount: performance.getEntriesByType('resource').length,

                // Paint Timing
                paintEntries: performance.getEntriesByType('paint').map(entry => ({
                    name: entry.name,
                    startTime: entry.startTime
                }))
            }
        })

        // FCP (First Contentful Paint) 추출
        const fcp = performanceMetrics.paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0

        // 결과 출력
        console.log('\n📊 Senior Dashboard Performance Metrics:')
        console.log('─'.repeat(50))
        console.log(`  Total Load Time:      ${totalLoadTime}ms`)
        console.log(`  DOM Content Loaded:   ${performanceMetrics.domContentLoaded}ms`)
        console.log(`  Page Load:            ${performanceMetrics.pageLoad}ms`)
        console.log(`  DOM Interactive:      ${performanceMetrics.domInteractive}ms`)
        console.log(`  First Contentful Paint: ${fcp.toFixed(0)}ms`)
        console.log(`  Resource Count:       ${performanceMetrics.resourceCount}`)
        console.log('─'.repeat(50))

        // 임계값 검사 (선택적 - 실패하지 않고 경고만)
        if (totalLoadTime > PERFORMANCE_THRESHOLDS.pageLoad) {
            console.warn(`⚠️  Page load time (${totalLoadTime}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.pageLoad}ms)`)
        }
        if (fcp > PERFORMANCE_THRESHOLDS.fcp) {
            console.warn(`⚠️  FCP (${fcp.toFixed(0)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.fcp}ms)`)
        }

        // 페이지가 정상 로드되었는지 확인
        await expect(page.locator('body')).toBeVisible()
    })

    test('Caregiver Dashboard 초기 로딩 성능 측정', async ({ page }) => {
        // 보호자 사용자로 인증 변경
        await setE2EAuth(page, { role: 'CAREGIVER', userId: 'perf-test-caregiver' })

        const startTime = Date.now()

        await page.goto('/caregiver', { waitUntil: 'networkidle' })

        const endTime = Date.now()
        const totalLoadTime = endTime - startTime

        const performanceMetrics = await page.evaluate(() => {
            const timing = performance.timing
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                pageLoad: timing.loadEventEnd - timing.navigationStart,
                paintEntries: performance.getEntriesByType('paint').map(entry => ({
                    name: entry.name,
                    startTime: entry.startTime
                }))
            }
        })

        const fcp = performanceMetrics.paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0

        console.log('\n📊 Caregiver Dashboard Performance Metrics:')
        console.log('─'.repeat(50))
        console.log(`  Total Load Time:        ${totalLoadTime}ms`)
        console.log(`  DOM Content Loaded:     ${performanceMetrics.domContentLoaded}ms`)
        console.log(`  Page Load:              ${performanceMetrics.pageLoad}ms`)
        console.log(`  First Contentful Paint: ${fcp.toFixed(0)}ms`)
        console.log('─'.repeat(50))

        await expect(page.locator('body')).toBeVisible()
    })

    test('로그인 페이지 초기 로딩 성능 (Cold Start)', async ({ page }) => {
        // 인증 없이 로그인 페이지 측정
        const startTime = Date.now()

        await page.goto('/login', { waitUntil: 'networkidle' })

        const endTime = Date.now()
        const totalLoadTime = endTime - startTime

        const performanceMetrics = await page.evaluate(() => {
            const timing = performance.timing
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                pageLoad: timing.loadEventEnd - timing.navigationStart,
                resourceCount: performance.getEntriesByType('resource').length
            }
        })

        console.log('\n📊 Login Page Performance Metrics (Cold Start):')
        console.log('─'.repeat(50))
        console.log(`  Total Load Time:      ${totalLoadTime}ms`)
        console.log(`  DOM Content Loaded:   ${performanceMetrics.domContentLoaded}ms`)
        console.log(`  Page Load:            ${performanceMetrics.pageLoad}ms`)
        console.log(`  Resource Count:       ${performanceMetrics.resourceCount}`)
        console.log('─'.repeat(50))

        await expect(page.locator('body')).toBeVisible()
    })
})

/**
 * 실행 방법:
 * cd Front && npx playwright test tests/e2e/performance.spec.js --reporter=list
 * 
 * 결과 해석:
 * - Total Load Time: 페이지 완전 로드까지 걸린 시간
 * - DOM Content Loaded: HTML 파싱 완료 시점
 * - FCP: 첫 콘텐츠가 화면에 표시된 시점
 * - Resource Count: 로드된 리소스(JS, CSS, 이미지 등) 수
 */
