import logger from '@core/utils/logger'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { Alert, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { toast } from '@shared/components/toast/toastStore'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import BackButton from '@shared/components/mui/BackButton'

const STATUS_LABEL = {
  ACTIVE: '치료 중',
  CURED: '완치',
  CHRONIC: '만성',
}

const formatDate = (value, withTime = false) => {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium',
      timeStyle: withTime ? 'short' : undefined,
    }).format(new Date(value))
  } catch {
    return value
  }
}

export const DiseaseDetailPage = () => {
  const navigate = useNavigate()
  const { diseaseId } = useParams()
  const [disease, setDisease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const loadDetail = async () => {
    setLoading(true)
    try {
      const detail = await diseaseApiClient.getDiseaseDetail(diseaseId)
      setDisease(detail)
    } catch (error) {
      logger.error('질병 상세 조회 실패', error)
      setDisease(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diseaseId])

  const handleDelete = async () => {
    if (!disease?.id) return
    const confirmed = window.confirm('삭제하면 휴지통으로 이동합니다. 계속할까요?')
    if (!confirmed) return
    setDeleting(true)
    try {
      await diseaseApiClient.remove(disease.id)
      toast.success('휴지통으로 이동했습니다.')
      navigate('/disease', { replace: true })
    } catch (error) {
      logger.error('질병 삭제 실패', error)
      toast.error('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <PageStack>
          <PageHeader title="질병 상세" leading={<BackButton onClick={() => navigate('/disease')} label="목록" />} />
          <Typography variant="body2" color="text.secondary">
            불러오는 중입니다...
          </Typography>
        </PageStack>
      </MainLayout>
    )
  }

  if (!disease) {
    return (
      <MainLayout>
        <PageStack>
          <PageHeader title="질병 상세" leading={<BackButton onClick={() => navigate('/disease')} label="목록" />} />
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/disease')}>
                목록으로
              </Button>
            }
          >
            질병 정보를 찾을 수 없습니다.
          </Alert>
        </PageStack>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          title={disease.name}
          leading={<BackButton onClick={() => navigate('/disease')} label="목록" />}
          subtitle={
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {disease.isCritical ? <Chip label="중요" color="error" size="small" /> : null}
                {disease.isPrivate ? <Chip label="비공개" color="default" size="small" /> : null}
                {disease.status ? (
                  <Chip label={STATUS_LABEL[disease.status] ?? disease.status} variant="outlined" size="small" />
                ) : null}
              </Stack>
            </Stack>
          }
          right={
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
                {deleting ? '삭제 중...' : '삭제'}
              </Button>
            </Stack>
          }
        />

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
            기본 정보
          </Typography>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                진단일
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {disease.isDiagnosedDateUnknown ? '날짜 모름' : formatDate(disease.diagnosedAt)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                상태
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {STATUS_LABEL[disease.status] ?? disease.status ?? '-'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                생성일
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatDate(disease.createdAt, true)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                수정일
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatDate(disease.updatedAt, true)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
            설명
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            {disease.description || '등록된 설명이 없습니다.'}
          </Typography>
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default DiseaseDetailPage
