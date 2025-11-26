import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { Card, CardBody, CardHeader } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { toast } from '@shared/components/toast/toastStore'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import styles from './DiseaseDetailPage.module.scss'

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
      console.error('질병 상세 조회 실패', error)
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
      console.error('질병 삭제 실패', error)
      toast.error('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.page}>
          <div className={styles.hint}>불러오는 중입니다...</div>
        </div>
      </MainLayout>
    )
  }

  if (!disease) {
    return (
      <MainLayout>
        <div className={styles.page}>
          <div className={styles.hint}>질병 정보를 찾을 수 없습니다.</div>
          <Button variant="ghost" onClick={() => navigate('/disease')}>
            목록으로 돌아가기
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.meta}>ID: {disease.id}</p>
            <h1>{disease.name}</h1>
            <div className={styles.badges}>
              {disease.isCritical && <span className={`${styles.badge} ${styles.critical}`}>중요</span>}
              {disease.isPrivate && <span className={`${styles.badge} ${styles.private}`}>비공개</span>}
              {disease.status && (
                <span className={styles.badge}>{STATUS_LABEL[disease.status] ?? disease.status}</span>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => navigate('/disease')}>
              목록
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader title="기본 정보" />
          <CardBody className={styles.bodyGrid}>
            <div>
              <p className={styles.label}>진단일</p>
              <p className={styles.value}>
                {disease.isDiagnosedDateUnknown ? '날짜 모름' : formatDate(disease.diagnosedAt)}
              </p>
            </div>
            <div>
              <p className={styles.label}>상태</p>
              <p className={styles.value}>{STATUS_LABEL[disease.status] ?? disease.status ?? '-'}</p>
            </div>
            <div>
              <p className={styles.label}>생성일</p>
              <p className={styles.value}>{formatDate(disease.createdAt, true)}</p>
            </div>
            <div>
              <p className={styles.label}>수정일</p>
              <p className={styles.value}>{formatDate(disease.updatedAt, true)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="설명" />
          <CardBody>
            <p className={styles.description}>{disease.description || '등록된 설명이 없습니다.'}</p>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}

export default DiseaseDetailPage
