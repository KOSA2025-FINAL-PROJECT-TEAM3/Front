import { useEffect, useMemo, useState } from 'react'
import styles from './MedicationForm.module.css'

const initialForm = {
  name: '',
  ingredient: '',
  dosage: '',
  startDate: '',
  endDate: '',
  quantity: '',
  remaining: '',
  expiryDate: '',
  notes: '',
  schedules: [],
}

export const MedicationForm = ({
  initialValues,
  onSubmit,
  loading,
  submitLabel = '약 등록',
  onCancel,
  shouldResetOnSubmit = true,
}) => {
  const mergedInitial = useMemo(
    () => {
      const merged = {
        ...initialForm,
        ...(initialValues || {}),
      }
      // 시간 형식 정규화 (HH:mm:ss -> HH:mm)
      if (merged.schedules) {
        merged.schedules = merged.schedules.map((s) => ({
          ...s,
          time: s.time ? s.time.substring(0, 5) : '',
        }))
      }
      return merged
    },
    [initialValues],
  )

  const [form, setForm] = useState(mergedInitial)

  useEffect(() => {
    setForm(mergedInitial)
  }, [mergedInitial])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...(form.schedules || [])]
    if (!newSchedules[index]) {
      newSchedules[index] = { time: '', daysOfWeek: '', active: true }
    }
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
    }
    setForm((prev) => ({ ...prev, schedules: newSchedules }))
  }

  const addSchedule = () => {
    setForm((prev) => ({
      ...prev,
      schedules: [...(prev.schedules || []), { time: '', daysOfWeek: '', active: true }],
    }))
  }

  const removeSchedule = (index) => {
    const newSchedules = [...(form.schedules || [])]
    newSchedules.splice(index, 1)
    setForm((prev) => ({ ...prev, schedules: newSchedules }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // 클라이언트 사이드 스케줄 중복 검증
    if (form.schedules && form.schedules.length > 0) {
      const timeMap = {} // time -> Set<day>
      for (const schedule of form.schedules) {
        if (!schedule.time || !schedule.daysOfWeek) continue
        
        if (!timeMap[schedule.time]) {
          timeMap[schedule.time] = new Set()
        }

        const days = schedule.daysOfWeek.split(',')
        for (const day of days) {
          if (timeMap[schedule.time].has(day)) {
            alert(`중복된 스케줄이 있습니다: ${schedule.time} (${day})`)
            return
          }
          timeMap[schedule.time].add(day)
        }
      }
    }

    await onSubmit?.(form)
    if (shouldResetOnSubmit) {
      setForm(initialForm)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h3>기본 정보</h3>
        <label>
          약 이름
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="예: Simvastatin"
            required
          />
        </label>
        <label>
          성분명
          <input
            name="ingredient"
            value={form.ingredient || ''}
            onChange={handleChange}
            placeholder="예: Simvastatin"
          />
        </label>
        <label>
          용량
          <input
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            placeholder="예: 20mg"
          />
        </label>
      </div>

      <div className={styles.section}>
        <h3>복용 기간 및 수량</h3>
        <div className={styles.row}>
          <label>
            시작일
            <input
              type="date"
              name="startDate"
              value={form.startDate || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            종료일
            <input
              type="date"
              name="endDate"
              value={form.endDate || ''}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className={styles.row}>
          <label>
            총 수량
            <input
              type="number"
              name="quantity"
              value={form.quantity || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            남은 수량
            <input
              type="number"
              name="remaining"
              value={form.remaining || ''}
              onChange={handleChange}
            />
          </label>
        </div>
        <label>
          유효기간
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate || ''}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className={styles.section}>
        <h3>복용 스케줄</h3>
        {(form.schedules || []).map((schedule, index) => (
          <div key={index} className={styles.scheduleRow}>
            <select
              value={schedule.time}
              onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
              required
              disabled={schedule.isTakenToday}
            >
              <option value="">시간 선택</option>
              {Array.from({ length: 48 }).map((_, i) => {
                const hour = Math.floor(i / 2).toString().padStart(2, '0')
                const minute = (i % 2) * 30 === 0 ? '00' : '30'
                const timeStr = `${hour}:${minute}`
                return (
                  <option key={timeStr} value={timeStr}>
                    {timeStr}
                  </option>
                )
              })}
            </select>

            <div className={styles.daySelector}>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`${styles.dayButton} ${schedule.daysOfWeek?.includes(day) ? styles.selected : ''
                    }`}
                  onClick={() => {
                    const currentDays = schedule.daysOfWeek ? schedule.daysOfWeek.split(',') : []
                    let newDays
                    if (currentDays.includes(day)) {
                      newDays = currentDays.filter((d) => d !== day)
                    } else {
                      newDays = [...currentDays, day]
                    }
                    // Sort days to keep order consistent (optional but good)
                    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
                    newDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))

                    handleScheduleChange(index, 'daysOfWeek', newDays.join(','))
                  }}
                  disabled={schedule.isTakenToday}
                >
                  {day}
                </button>
              ))}
            </div>

            {schedule.isTakenToday ? (
              <span className={styles.takenBadge}>복용 완료</span>
            ) : (
              <button
                type="button"
                onClick={() => removeSchedule(index)}
                className={styles.removeButton}
              >
                삭제
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSchedule}
          className={styles.addButton}
        >
          + 스케줄 추가
        </button>
      </div>

      <div className={styles.section}>
        <h3>기타</h3>
        <label>
          메모 / 주의사항
          <textarea
            name="notes"
            value={form.notes || ''}
            onChange={handleChange}
            placeholder="예: 식후 30분 복용"
          />
        </label>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.secondaryButton}
            disabled={loading}
          >
            취소
          </button>
        )}
        <button type="submit" disabled={loading}>
          {loading ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default MedicationForm
