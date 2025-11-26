import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { Button } from '@shared/components/ui/Button'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import DiseaseList from '../components/DiseaseList'
import DiseaseTrash from '../components/DiseaseTrash'
import DiseaseForm from '../components/DiseaseForm'
import Modal from '@shared/components/ui/Modal'
import { useDiseases } from '../hooks/useDiseases'
import styles from './Disease.module.scss'

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
  } = useDiseases()
  const [showTrash, setShowTrash] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(null)

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
      console.error('질병 삭제 실패', error)
      toast.error('삭제에 실패했습니다.')
    }
  }

  const handleExportPdf = async () => {
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
      console.error('PDF 다운로드 실패', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    } finally {
      setExporting(false)
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
      console.error('휴지통 비우기 실패', error)
      toast.error('휴지통 비우기에 실패했습니다.')
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
      console.error('질병 등록 실패', error)
      toast.error('저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
      refresh()
    }
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>질병 관리</h1>
            <p>등록된 질병을 확인하고 삭제 시 휴지통으로 이동합니다.</p>
          </div>
          <div className={styles.actions}>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              질병 추가
            </Button>
            <Button variant="ghost" onClick={() => setShowTrash((prev) => !prev)}>
              {showTrash ? '목록 보기' : '휴지통'}
            </Button>
            <Button variant="secondary" onClick={handleRefresh}>
              새로고침
            </Button>
            <Button variant="primary" onClick={handleExportPdf} disabled={exporting || !userId}>
              {exporting ? '다운로드 중...' : 'PDF 다운로드'}
            </Button>
          </div>
        </header>

        {!userId && <div className={styles.hint}>로그인 정보를 확인할 수 없습니다.</div>}

        {showTrash ? (
          <DiseaseTrash items={trash} loading={trashLoading} onEmptyTrash={handleEmptyTrash} />
        ) : (
          <DiseaseList
            diseases={diseases}
            loading={loading}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}

        <Modal
          isOpen={showForm}
          title="질병 등록"
          description="필수 정보만 입력해도 등록할 수 있습니다."
          onClose={() => setShowForm(false)}
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
        </Modal>
      </div>
    </MainLayout>
  )
}

export default DiseasePage
