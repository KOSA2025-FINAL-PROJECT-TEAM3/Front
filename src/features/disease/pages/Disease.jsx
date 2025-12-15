import logger from '@core/utils/logger'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import DiseaseList from '../components/DiseaseList'
import DiseaseTrash from '../components/DiseaseTrash'
import DiseaseForm from '../components/DiseaseForm'
import AppDialog from '@shared/components/mui/AppDialog'
import AppButton from '@shared/components/mui/AppButton'
import { SpeedDialFab } from '@shared/components/mui/SpeedDialFab'
import AddIcon from '@mui/icons-material/Add'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { Box, Container, Paper, Stack, Typography } from '@mui/material'
import { useDiseases } from '../hooks/useDiseases'
import { useVoiceActionStore } from '@/features/voice/stores/voiceActionStore'

export const DiseasePage = () => {
  const navigate = useNavigate()
  const {
    userId,
    diseases,
    trash,
    loading,
    trashLoading,
    refresh,
    refreshTrash,
    deleteDisease,
    emptyTrash,
    createDisease,
    updateDisease,
    restoreDisease,
  } = useDiseases()
  
  const { consumeAction } = useVoiceActionStore()
  
  const [showTrash, setShowTrash] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleExportPdf = useCallback(async () => {
    if (!userId) return
    setExporting(true)
    try {
      const blob = await diseaseApiClient.exportPdf(userId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'diseases.pdf'
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF 다운로드를 시작합니다.')
    } catch (error) {
      logger.error('PDF 다운로드 실패', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }, [userId])

  // 음성 명령 (질병 자동 입력 및 PDF 다운로드)
  useEffect(() => {
    // 1. 질병 등록 자동 채우기
    const fillAction = consumeAction('AUTO_FILL_DISEASE')
    if (fillAction && fillAction.params?.diseaseName) {
      setEditing({ name: fillAction.params.diseaseName })
      setShowForm(true)
      toast.info(`'${fillAction.params.diseaseName}' 등록 화면을 열었습니다.`)
    }

    // 2. PDF 다운로드
    const downloadAction = consumeAction('DOWNLOAD_PDF')
    if (downloadAction) {
      handleExportPdf()
    }
  }, [consumeAction, handleExportPdf])

  const fabActions = [
    {
      label: '질병 추가',
      icon: <AddIcon />,
      onClick: () => setShowForm(true),
    },
    {
      label: exporting ? '다운로드 중...' : 'PDF 내보내기',
      icon: <FileDownloadIcon />,
      onClick: () => !exporting && userId && handleExportPdf(),
    },
  ]

  useEffect(() => {
    if (showTrash) {
      refreshTrash()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrash])

  const handleSelect = (disease) => {
    if (!disease?.id) return
    navigate(`/disease/${disease.id}`)
  }

  const handleEdit = (disease) => {
    setEditing(disease)
    setShowForm(true)
  }

  const handleDelete = async (disease) => {
    if (!disease?.id) return
    const confirmed = window.confirm('이 질병을 삭제하면 휴지통으로 이동합니다. 계속할까요?')
    if (!confirmed) return
    try {
      await deleteDisease(disease.id)
      toast.success('휴지통으로 이동했습니다.')
      setShowTrash(true)
    } catch (error) {
      logger.error('질병 삭제 실패', error)
      toast.error('삭제에 실패했습니다.')
    }
  }

  const handleEmptyTrash = async () => {
    const confirmed = window.confirm('휴지통의 항목을 모두 영구 삭제할까요?')
    if (!confirmed) return
    try {
      await emptyTrash()
      toast.success('휴지통을 비웠습니다.')
      await refresh()
    } catch (error) {
      logger.error('휴지통 비우기 실패', error)
      toast.error('휴지통 비우기에 실패했습니다.')
    }
  }

  const handleRestore = async (diseaseId) => {
    if (!diseaseId) return
    const confirmed = window.confirm('선택한 질병을 목록으로 복원할까요?')
    if (!confirmed) return
    try {
      await restoreDisease(diseaseId)
      toast.success('질병이 복원되었습니다.')
    } catch (error) {
      logger.error('복원 실패', error)
      toast.error('복원에 실패했습니다.')
    }
  }

  const handleRefresh = () => {
    refresh()
    if (showTrash) {
      refreshTrash()
    }
  }

  const handleSubmitForm = async (payload) => {
    setSubmitting(true)
    try {
      if (editing?.id) {
        await updateDisease(editing.id, payload)
        toast.success('질병 정보가 수정되었습니다.')
      } else {
        await createDisease(payload)
        toast.success('질병이 등록되었습니다.')
      }
      setShowForm(false)
      setEditing(null)
    } catch (error) {
      logger.error('질병 등록 실패', error)
      toast.error('저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
      refresh()
    }
  }

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                질병 관리
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                등록된 질병을 확인하고 삭제 시 휴지통으로 이동합니다.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ md: 'flex-end' }}>
              <AppButton variant="primary" onClick={() => setShowForm(true)}>
                질병 추가
              </AppButton>
              <AppButton variant="ghost" onClick={() => setShowTrash((prev) => !prev)}>
                {showTrash ? '목록 보기' : '휴지통'}
              </AppButton>
              <AppButton variant="secondary" onClick={handleRefresh}>
                새로고침
              </AppButton>
              <AppButton variant="primary" onClick={handleExportPdf} disabled={exporting || !userId}>
                {exporting ? '다운로드 중...' : 'PDF 다운로드'}
              </AppButton>
            </Stack>
          </Stack>
        </Paper>

        {!userId ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            로그인 정보를 확인할 수 없습니다.
          </Typography>
        ) : null}

        {showTrash ? (
          <DiseaseTrash items={trash} loading={trashLoading} onEmptyTrash={handleEmptyTrash} onRestore={handleRestore} />
        ) : (
          <DiseaseList
            diseases={diseases}
            loading={loading}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}

        <SpeedDialFab actions={fabActions} />

        <AppDialog
          isOpen={showForm}
          title="질병 등록"
          description="필수 정보만 입력해도 등록할 수 있습니다."
          onClose={() => setShowForm(false)}
          maxWidth="sm"
        >
          <DiseaseForm
            initialValue={editing}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
            submitting={submitting}
          />
        </AppDialog>
      </Container>
    </MainLayout>
  )
}

export default DiseasePage
