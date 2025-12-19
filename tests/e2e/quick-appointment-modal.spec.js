import { expect, test } from '@playwright/test'
import { mockApi, setE2EAuth } from './utils/e2eSetup'

/**
 * 병원 예약 UX 통합 - QuickAppointmentModal 테스트
 * 
 * PlaceSearchPage에서 병원 선택 후 빠른 예약 모달이 정상 동작하는지 검증
 */
test.describe('빠른 예약 모달 (QuickAppointmentModal)', () => {
    let api

    test.beforeEach(async ({ page }) => {
        await setE2EAuth(page, { customerRole: 'SENIOR' })
        api = await mockApi(page)

        // 추가 API 모킹: 병원 예약 관련
        await page.route('**/api/appointments', async (route) => {
            const method = route.request().method()
            if (method === 'POST') {
                // 예약 생성 성공 응답
                return route.fulfill({
                    status: 201,
                    json: { id: 1, hospitalName: '테스트병원', status: 'SCHEDULED' }
                })
            }
            if (method === 'GET') {
                return route.fulfill({ status: 200, json: [] })
            }
            return route.continue()
        })
    })

    test('PlaceSearchPage에서 병원 카드 렌더링 및 예약 버튼 표시', async ({ page }) => {
        // 카카오 Maps SDK 모킹 (실제 키 없이 테스트)
        await page.addInitScript(() => {
            window.kakao = {
                maps: {
                    load: (cb) => cb(),
                    Map: function () { return { setCenter: () => { }, getCenter: () => ({ getLat: () => 37.5, getLng: () => 127 }), setBounds: () => { } } },
                    LatLng: function (lat, lng) { return { getLat: () => lat, getLng: () => lng } },
                    LatLngBounds: function () { return { extend: () => { } } },
                    Marker: function () { return { setMap: () => { } } },
                    InfoWindow: function () { return { setContent: () => { }, open: () => { } } },
                    CustomOverlay: function () { return { setMap: () => { }, setPosition: () => { }, setContent: () => { } } },
                    event: { addListener: () => { }, removeListener: () => { } },
                    services: {
                        Places: function () {
                            return {
                                categorySearch: (code, cb) => cb([
                                    { id: '1', place_name: '서울대학교병원', road_address_name: '서울시 종로구', phone: '02-1234-5678', x: '127', y: '37.5', category_name: '의료,건강 > 병원 > 상급종합병원' },
                                    { id: '2', place_name: '분당서울대병원', road_address_name: '경기도 성남시', phone: '031-1234-5678', x: '127.1', y: '37.4', category_name: '의료,건강 > 병원 > 내과' }
                                ], 'OK'),
                                keywordSearch: (kw, cb) => cb([], 'ZERO_RESULT')
                            }
                        },
                        Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' },
                        SortBy: { DISTANCE: 'DISTANCE' }
                    }
                }
            }
        })

        await page.goto('/places')

        // 병원 탭이 기본 선택
        await expect(page.getByRole('tab', { name: '병원' })).toHaveAttribute('aria-selected', 'true')

        // 검색 결과 렌더링 대기
        await expect(page.getByText('서울대학교병원')).toBeVisible({ timeout: 15000 })

        // 예약 버튼 확인 (병원 탭에서만 표시)
        const appointmentButtons = page.getByRole('button', { name: '예약' })
        await expect(appointmentButtons.first()).toBeVisible()
    })

    test('예약 버튼 클릭 시 QuickAppointmentModal 오픈', async ({ page }) => {
        // 카카오 Maps SDK 모킹
        await page.addInitScript(() => {
            window.kakao = {
                maps: {
                    load: (cb) => cb(),
                    Map: function () { return { setCenter: () => { }, getCenter: () => ({ getLat: () => 37.5, getLng: () => 127 }), setBounds: () => { } } },
                    LatLng: function (lat, lng) { return { getLat: () => lat, getLng: () => lng } },
                    LatLngBounds: function () { return { extend: () => { } } },
                    Marker: function () { return { setMap: () => { } } },
                    InfoWindow: function () { return { setContent: () => { }, open: () => { } } },
                    CustomOverlay: function () { return { setMap: () => { }, setPosition: () => { }, setContent: () => { } } },
                    event: { addListener: () => { }, removeListener: () => { } },
                    services: {
                        Places: function () {
                            return {
                                categorySearch: (code, cb) => cb([
                                    { id: '1', place_name: '테스트병원', road_address_name: '서울시 강남구', phone: '02-9999-0000', x: '127', y: '37.5', category_name: '의료,건강 > 병원 > 내과' }
                                ], 'OK'),
                                keywordSearch: (kw, cb) => cb([], 'ZERO_RESULT')
                            }
                        },
                        Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' },
                        SortBy: { DISTANCE: 'DISTANCE' }
                    }
                }
            }
        })

        await page.goto('/places')

        // 병원 결과 대기
        await expect(page.getByText('테스트병원')).toBeVisible({ timeout: 15000 })

        // 예약 버튼 클릭
        await page.getByRole('button', { name: '예약' }).first().click()

        // 모달 오픈 확인
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByRole('heading', { name: '빠른 예약 등록' })).toBeVisible()

        // 병원 정보가 자동으로 채워져 있는지 확인
        await expect(page.getByText('테스트병원')).toBeVisible()
        await expect(page.getByText('서울시 강남구')).toBeVisible()
        await expect(page.getByText('02-9999-0000')).toBeVisible()

        // 날짜/시간 입력 필드 확인
        await expect(page.getByLabel('날짜')).toBeVisible()
        await expect(page.getByLabel('시간')).toBeVisible()
    })

    test('약국 탭에서는 예약 버튼이 표시되지 않음', async ({ page }) => {
        // 카카오 Maps SDK 모킹
        await page.addInitScript(() => {
            window.kakao = {
                maps: {
                    load: (cb) => cb(),
                    Map: function () { return { setCenter: () => { }, getCenter: () => ({ getLat: () => 37.5, getLng: () => 127 }), setBounds: () => { } } },
                    LatLng: function (lat, lng) { return { getLat: () => lat, getLng: () => lng } },
                    LatLngBounds: function () { return { extend: () => { } } },
                    Marker: function () { return { setMap: () => { } } },
                    InfoWindow: function () { return { setContent: () => { }, open: () => { } } },
                    CustomOverlay: function () { return { setMap: () => { }, setPosition: () => { }, setContent: () => { } } },
                    event: { addListener: () => { }, removeListener: () => { } },
                    services: {
                        Places: function () {
                            return {
                                categorySearch: (code, cb) => cb([
                                    { id: '3', place_name: '온누리약국', road_address_name: '서울시 마포구', phone: '02-1111-2222', x: '127', y: '37.5', category_name: '의료,건강 > 약국' }
                                ], 'OK'),
                                keywordSearch: (kw, cb) => cb([], 'ZERO_RESULT')
                            }
                        },
                        Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT' },
                        SortBy: { DISTANCE: 'DISTANCE' }
                    }
                }
            }
        })

        await page.goto('/places')

        // 약국 탭 클릭
        await page.getByRole('tab', { name: '약국' }).click()

        // 약국 결과 대기
        await expect(page.getByText('온누리약국')).toBeVisible({ timeout: 15000 })

        // 예약 버튼이 없어야 함
        const appointmentButtons = page.getByRole('button', { name: '예약' })
        await expect(appointmentButtons).toHaveCount(0)
    })
})
