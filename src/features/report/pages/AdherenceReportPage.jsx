import logger from '@core/utils/logger'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/mui/BackButton'
import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { reportApiClient } from '@/core/services/api/reportApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { useVoiceActionStore } from '@/features/voice/stores/voiceActionStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'

/**
 * 복약 순응도 리포트 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const AdherenceReportPage = () => {
  const [loading, setLoading] = useState(true)
  const [adherenceData, setAdherenceData] = useState(null)
  const [recentHistory, setRecentHistory] = useState([])
  const { consumeAction } = useVoiceActionStore()
  const user = useAuthStore((state) => state.user)

  const handleDownloadPdf = useCallback(async () => {
    try {
      toast.info('리포트를 생성하고 있습니다...')

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)

      const startDateStr = startDate.toISOString().slice(0, 10)
      const endDateStr = endDate.toISOString().slice(0, 10)

      const report = await reportApiClient.getAdherenceReport(startDateStr, endDateStr)

      const printable = window.open('', '_blank', 'noopener,noreferrer')
      if (!printable) {
        toast.error('팝업이 차단되어 PDF 출력을 시작할 수 없습니다.')
        return
      }

      const title = '복약 순응도 리포트'
      const overall = Math.round((report?.overallAdherence ?? 0) * 10) / 10
      const items = Array.isArray(report?.medications) ? report.medications : []
      const generatedAt = new Date().toLocaleString('ko-KR')
      const userLabel = report?.userName || user?.name || user?.email || '사용자'

      const rows = items
        .map((item) => {
          const rate = Math.round((item?.adherenceRate ?? 0) * 10) / 10
          const scheduled = item?.totalScheduled ?? 0
          const completed = item?.completed ?? 0
          const name = (item?.medicationName || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
          return `
            <tr>
              <td>${name}</td>
              <td class="num">${completed}</td>
              <td class="num">${scheduled}</td>
              <td class="num">${rate}%</td>
            </tr>
          `
        })
        .join('')

      printable.document.open()
      printable.document.write(`<!doctype html>
        <html lang="ko">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${title}</title>
            <style>
              :root { color-scheme: light; }
              body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 32px; color: #111; }
              h1 { font-size: 22px; margin: 0 0 6px; }
              .meta { color: #555; font-size: 12px; margin-bottom: 18px; }
              .summary { display: flex; gap: 18px; align-items: baseline; margin: 18px 0 22px; }
              .pill { display: inline-flex; gap: 8px; align-items: baseline; padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px; }
              .label { color: #666; font-size: 12px; }
              .value { font-weight: 800; font-size: 18px; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { border-bottom: 1px solid #eee; padding: 10px 8px; text-align: left; font-size: 13px; }
              th { background: #fafafa; font-weight: 700; }
              td.num { text-align: right; font-variant-numeric: tabular-nums; }
              .footer { margin-top: 18px; color: #666; font-size: 11px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="meta">${userLabel} · 기간 ${startDateStr} ~ ${endDateStr} · 생성 ${generatedAt}</div>

            <div class="summary">
              <div class="pill">
                <div>
                  <div class="label">전체 순응도</div>
                  <div class="value">${overall}%</div>
                </div>
              </div>
              <div class="pill">
                <div>
                  <div class="label">약 개수</div>
                  <div class="value">${items.length}개</div>
                </div>
              </div>
            </div>

            <h2 style="font-size: 14px; margin: 0 0 6px;">약별 순응도</h2>
            <table>
              <thead>
                <tr>
                  <th>약 이름</th>
                  <th class="num">완료</th>
                  <th class="num">총 예정</th>
                  <th class="num">순응도</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="4" style="color:#666;">데이터가 없습니다.</td></tr>'}
              </tbody>
            </table>

            <div class="footer">브라우저 인쇄 기능으로 “PDF로 저장”을 선택하면 파일로 저장할 수 있습니다.</div>
          </body>
        </html>`)
      printable.document.close()

      setTimeout(() => {
        printable.focus()
        printable.print()
        printable.close()
      }, 150)
    } catch (error) {
      logger.error('PDF 다운로드 실패:', error)
      toast.error('리포트 생성에 실패했습니다')
    }
  }, [user])

  // 음성 명령 처리 (PDF 다운로드)
  useEffect(() => {
    const action = consumeAction('DOWNLOAD_PDF')
    if (action) {
      handleDownloadPdf()
    }
  }, [consumeAction, handleDownloadPdf])

  useEffect(() => {
    const fetchAdherenceData = async () => {
      try {
        setLoading(true)

        // 최근 30일 순응도 요약
        const summary = await medicationLogApiClient.getAdherenceSummary(30)

        // 최근 14일 일별 순응도
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 14)

        const dailyData = await medicationLogApiClient.getDailyAdherence(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )

        setAdherenceData(summary)
        setRecentHistory(dailyData || [])
      } catch (error) {
        logger.error('순응도 데이터 로딩 실패:', error)
        toast.error('순응도 데이터를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchAdherenceData()
  }, [])

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'partial':
        return '일부'
      case 'missed':
        return '누락'
      default:
        return ''
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'partial':
        return 'warning'
      case 'missed':
        return 'error'
      default:
        return 'default'
    }
  }

  const calculateStatus = (completed, total) => {
    if (total === 0) return 'missed'
    const rate = completed / total
    if (rate === 1) return 'completed'
    if (rate > 0) return 'partial'
    return 'missed'
  }

  const insights = useMemo(() => {
    if (!adherenceData) return []
    const lines = []
    if ((adherenceData.overall || 0) >= 80) {
      lines.push('지난 한 달간 꾸준히 복용하고 있습니다.')
    } else if ((adherenceData.overall || 0) >= 50) {
      lines.push('복약 순응도를 높이기 위해 알림 설정을 활용해보세요.')
    } else {
      lines.push('복약 누락이 많습니다. 규칙적인 복용이 중요합니다.')
    }
    if ((adherenceData.streak || 0) >= 7) {
      lines.push(`연속 ${adherenceData.streak}일 복용 중입니다.`)
    }
    if ((adherenceData.thisWeek || 0) < (adherenceData.thisMonth || 0)) {
      lines.push('이번 주 순응도가 낮습니다. 주말 복약에 특히 주의하세요.')
    }
    return lines
  }, [adherenceData])

  if (loading) {
    return (
      <MainLayout>
        <PageStack>
          <PageHeader leading={<BackButton />} title="복약 순응도 리포트" subtitle="리포트를 불러오는 중..." />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.secondary">로딩 중...</Typography>
          </Paper>
        </PageStack>
      </MainLayout>
    )
  }

  if (!adherenceData) {
    return (
      <MainLayout>
        <PageStack>
          <PageHeader leading={<BackButton />} title="복약 순응도 리포트" subtitle="데이터를 불러올 수 없습니다." />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.secondary">데이터를 불러올 수 없습니다</Typography>
          </Paper>
        </PageStack>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title="복약 순응도 리포트"
          right={
            <Button variant="outlined" onClick={handleDownloadPdf}>
              PDF 저장
            </Button>
          }
        />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              최근 30일 요약
            </Typography>
            <Stack direction="row" spacing={2} alignItems="baseline">
              <Typography variant="h4" fontWeight={900}>
                {adherenceData.overall || 0}%
              </Typography>
              <Typography color="text.secondary">전체 복약 순응도</Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  이번 주
                </Typography>
                <Typography fontWeight={900} sx={{ mt: 0.25 }}>
                  {adherenceData.thisWeek || 0}%
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  이번 달
                </Typography>
                <Typography fontWeight={900} sx={{ mt: 0.25 }}>
                  {adherenceData.thisMonth || 0}%
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  연속 복용
                </Typography>
                <Typography fontWeight={900} sx={{ mt: 0.25 }}>
                  {adherenceData.streak || 0}일
                </Typography>
              </Paper>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
            최근 복약 기록
          </Typography>

          {recentHistory.length === 0 ? (
            <Typography color="text.secondary">최근 복약 기록이 없습니다</Typography>
          ) : (
            <Stack spacing={1}>
              {recentHistory.map((day, index) => {
                const completed = day.completed || day.count
                const total = day.total || 0
                const status = calculateStatus(completed, total)
                const progress = total > 0 ? (completed / total) * 100 : 0

                return (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={800}>
                        {new Date(day.date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <Chip size="small" color={getStatusColor(status)} label={getStatusLabel(status)} />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress variant="determinate" value={progress} color={getStatusColor(status)} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56, textAlign: 'right' }}>
                        {completed}/{total}
                      </Typography>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
            인사이트
          </Typography>
          {insights.length === 0 ? (
            <Typography color="text.secondary">표시할 인사이트가 없습니다.</Typography>
          ) : (
            <Stack spacing={0.75}>
              {insights.map((line) => (
                <Typography key={line} variant="body2" color="text.secondary">
                  - {line}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default AdherenceReportPage
