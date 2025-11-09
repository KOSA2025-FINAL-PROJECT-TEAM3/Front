import { useState } from 'react'
import styles from './MedicationForm.module.scss'

const initialForm = {
  name: '',
  dosage: '',
  schedule: '',
  instructions: '',
}

export const MedicationForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState(initialForm)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit?.(form)
    setForm(initialForm)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
        용량
        <input
          name="dosage"
          value={form.dosage}
          onChange={handleChange}
          placeholder="예: 20mg"
        />
      </label>
      <label>
        복용 일정
        <input
          name="schedule"
          value={form.schedule}
          onChange={handleChange}
          placeholder="예: 매일 저녁 식후"
        />
      </label>
      <label>
        주의사항
        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          placeholder="예: 자몽 주스와 함께 복용 금지"
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? '등록 중...' : '약 등록'}
      </button>
    </form>
  )
}

export default MedicationForm
