import { useMemo, useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import styles from './DiseaseForm.module.scss'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '치료 중' },
  { value: 'CURED', label: '완치' },
  { value: 'CHRONIC', label: '만성' },
]

const normalizeDate = (value) => {
  if (!value) return ''
  return value.slice(0, 10)
}

export const DiseaseForm = ({ initialValue, onSubmit, onCancel, submitting = false }) => {
  const values = initialValue || {}
  const [form, setForm] = useState({
    name: values.name || '',
    code: values.code || '',
    diagnosedAt: values.diagnosedAt || '',
    isDiagnosedDateUnknown: values.isDiagnosedDateUnknown || false,
    status: values.status || 'ACTIVE',
    isPrivate: values.isPrivate || false,
    isCritical: values.isCritical || false,
    description: values.description || '',
  })
  const [errors, setErrors] = useState({})

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) {
      setErrors({ name: '병명은 필수입니다.' })
      return
    }
    setErrors({})
    if (typeof onSubmit === 'function') {
      await onSubmit({
        ...form,
        diagnosedAt: form.isDiagnosedDateUnknown ? null : form.diagnosedAt || null,
      })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="name">병명 *</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="예) 고혈압"
          required
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="code">코드</label>
          <input
            id="code"
            name="code"
            value={form.code}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="예) I10"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="status">상태</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="diagnosedAt">진단일</label>
          <input
            id="diagnosedAt"
            type="date"
            name="diagnosedAt"
            value={normalizeDate(form.diagnosedAt)}
            onChange={(e) => handleChange('diagnosedAt', e.target.value)}
            disabled={form.isDiagnosedDateUnknown}
          />
        </div>
        <div className={styles.checkboxField}>
          <label htmlFor="unknownDate" className={styles.checkboxLabel}>
            <input
              id="unknownDate"
              type="checkbox"
              checked={form.isDiagnosedDateUnknown}
              onChange={(e) => handleChange('isDiagnosedDateUnknown', e.target.checked)}
            />
            날짜 모름
          </label>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={form.isCritical}
            onChange={(e) => handleChange('isCritical', e.target.checked)}
          />
          중요 질병
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={form.isPrivate}
            onChange={(e) => handleChange('isPrivate', e.target.checked)}
          />
          비공개
        </label>
      </div>

      <div className={styles.field}>
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="증상이나 특이사항을 입력하세요."
        />
      </div>

      <div className={styles.footer}>
        <Button variant="ghost" type="button" onClick={onCancel}>
          취소
        </Button>
        <Button variant="primary" type="submit" disabled={!canSubmit} loading={submitting}>
          {initialValue?.id ? '수정' : '등록'}
        </Button>
      </div>
    </form>
  )
}

export default DiseaseForm
