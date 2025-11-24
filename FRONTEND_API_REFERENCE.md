# Frontend API Reference - Code Examples

Complete code examples for integrating with the backend API in the React frontend.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Authentication](#authentication)
3. [Medications](#medications)
4. [Family Management](#family-management)
5. [Diet & Food Warnings](#diet--food-warnings)
6. [Disease & Symptoms](#disease--symptoms)
7. [Chat & Consultation](#chat--consultation)
8. [OCR & Prescription Scanning](#ocr--prescription-scanning)
9. [Advanced Patterns](#advanced-patterns)

---

## Setup & Configuration

### Creating API Clients

**Base Pattern** (`src/core/services/api/newFeatureApiClient.js`):

```javascript
import ApiClient from './ApiClient'

class NewFeatureApiClient extends ApiClient {
  constructor() {
    super({ basePath: '/api/new-feature' })
  }

  list(filters = {}) {
    return this.get('/', undefined, {
      mockResponse: () => [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ],
    })
  }

  get(id) {
    return this.get(`/${id}`, undefined, {
      mockResponse: () => ({ id, name: 'Item' }),
    })
  }

  create(payload) {
    return this.post('/', payload, undefined, {
      mockResponse: () => ({
        id: `new-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      }),
    })
  }

  update(id, payload) {
    return this.patch(`/${id}`, payload, undefined, {
      mockResponse: () => ({
        id,
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    })
  }

  delete(id) {
    return this.delete(`/${id}`, undefined, {
      mockResponse: () => ({ success: true, id }),
    })
  }
}

export const newFeatureApiClient = new NewFeatureApiClient()
export { NewFeatureApiClient }
```

---

## Authentication

### Login Example

```javascript
// File: src/features/auth/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApiClient } from '@core/services/api/authApiClient'
import { useAuthStore } from '@features/auth/store/authStore'

export function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call backend API
      const response = await authApiClient.login(email, password)

      // Store token
      localStorage.setItem('amapill_token', response.accessToken)
      localStorage.setItem('amapill_refresh_token', response.refreshToken || '')

      // Store user data in Zustand
      setUser(response.user)
      setToken(response.accessToken)

      // Navigate to next page
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Kakao Login Integration

```javascript
// File: src/features/auth/pages/KakaoCallback.jsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApiClient } from '@core/services/api/authApiClient'
import { useAuthStore } from '@features/auth/store/authStore'

export default function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser, setToken } = useAuthStore()

  useEffect(() => {
    const authorizationCode = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Kakao auth error:', error)
      navigate('/login')
      return
    }

    if (authorizationCode) {
      handleKakaoLogin(authorizationCode)
    }
  }, [searchParams, navigate])

  async function handleKakaoLogin(authCode) {
    try {
      const response = await authApiClient.kakaoLogin(authCode)

      // Store credentials
      localStorage.setItem('amapill_token', response.accessToken)
      setUser(response.user)
      setToken(response.accessToken)

      // If user needs to select role
      if (!response.user.role) {
        navigate('/role-selection')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Kakao login failed:', error)
      navigate('/login')
    }
  }

  return <div>Processing Kakao login...</div>
}
```

### Logout

```javascript
// File: src/features/auth/hooks/useLogout.js
import { useNavigate } from 'react-router-dom'
import { authApiClient } from '@core/services/api/authApiClient'
import { useAuthStore } from '@features/auth/store/authStore'

export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  return async function logout() {
    try {
      const token = localStorage.getItem('amapill_token')

      // Call logout endpoint
      if (token) {
        await authApiClient.logout(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API success
      localStorage.removeItem('amapill_token')
      localStorage.removeItem('amapill_refresh_token')
      clearAuth()
      navigate('/login')
    }
  }
}
```

---

## Medications

### Fetch Medications List

```javascript
// File: src/features/medication/hooks/useMedications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { medicationApiClient } from '@core/services/api/medicationApiClient'

export function useMedications() {
  return useQuery({
    queryKey: ['medications'],
    queryFn: () => medicationApiClient.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

export function useMedicationDetail(id) {
  return useQuery({
    queryKey: ['medication', id],
    queryFn: () => medicationApiClient.get(id),
    enabled: !!id,
  })
}
```

### Using in Component

```javascript
// File: src/features/medication/pages/MedicationManagement.jsx
import { useMedications } from '@features/medication/hooks/useMedications'
import { MedicationCard } from '@features/medication/components/MedicationCard'

export function MedicationManagement() {
  const { data: medications, isLoading, error } = useMedications()

  if (isLoading) return <div>Loading medications...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="medication-grid">
      {medications?.map(med => (
        <MedicationCard key={med.id} medication={med} />
      ))}
    </div>
  )
}
```

### Create Medication

```javascript
// File: src/features/medication/pages/MedicationForm.jsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { medicationApiClient } from '@core/services/api/medicationApiClient'

export function MedicationForm({ onSuccess }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  })

  const createMutation = useMutation({
    mutationFn: (payload) => medicationApiClient.create(payload),
    onSuccess: (newMed) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      onSuccess?.(newMed)
      // Reset form
      setFormData({ name: '', dosage: '', frequency: 'once daily', startDate: '', endDate: '', notes: '' })
    },
    onError: (error) => {
      console.error('Failed to create medication:', error)
    },
  })

  async function handleSubmit(e) {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Medication name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Dosage (e.g., 500mg)"
        value={formData.dosage}
        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
        required
      />
      <select
        value={formData.frequency}
        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
      >
        <option>once daily</option>
        <option>twice daily</option>
        <option>three times daily</option>
        <option>as needed</option>
      </select>
      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        required
      />
      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Adding...' : 'Add Medication'}
      </button>
      {createMutation.error && (
        <div className="error">Error: {createMutation.error.message}</div>
      )}
    </form>
  )
}
```

### Update & Delete Medications

```javascript
// File: src/features/medication/hooks/useMedicationMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { medicationApiClient } from '@core/services/api/medicationApiClient'

export function useUpdateMedication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) =>
      medicationApiClient.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
    },
  })
}

export function useDeleteMedication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => medicationApiClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
    },
  })
}
```

---

## Family Management

### Fetch Family Members

```javascript
// File: src/features/family/hooks/useFamilyMembers.js
import { useQuery } from '@tanstack/react-query'
import { familyApiClient } from '@core/services/api/familyApiClient'

export function useFamilyMembers() {
  return useQuery({
    queryKey: ['family', 'members'],
    queryFn: () => familyApiClient.list(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
```

### Invite Family Member

```javascript
// File: src/features/family/pages/FamilyInvite.jsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { familyApiClient } from '@core/services/api/familyApiClient'

export function FamilyInvitePage() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('caregiver')

  const inviteMutation = useMutation({
    mutationFn: (payload) => familyApiClient.invite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'members'] })
      alert('Invitation sent!')
      setEmail('')
    },
  })

  function handleInvite(e) {
    e.preventDefault()
    inviteMutation.mutate({
      email,
      role,
      permissions: ['view_medications', 'view_diet', 'message'],
    })
  }

  return (
    <form onSubmit={handleInvite}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Family member email"
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="senior">Senior (Parent)</option>
        <option value="caregiver">Caregiver (Child)</option>
      </select>
      <button type="submit" disabled={inviteMutation.isPending}>
        {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
      </button>
    </form>
  )
}
```

---

## Diet & Food Warnings

### Fetch Food Warnings

```javascript
// File: src/features/diet/hooks/useFoodWarnings.js
import { useQuery } from '@tanstack/react-query'
import { dietApiClient } from '@core/services/api/dietApiClient'

export function useFoodWarnings() {
  return useQuery({
    queryKey: ['diet', 'warnings'],
    queryFn: () => dietApiClient.getWarnings(),
  })
}
```

### Log Diet

```javascript
// File: src/features/diet/pages/DietLogPage.jsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dietApiClient } from '@core/services/api/dietApiClient'
import { useState } from 'react'

export function DietLogPage() {
  const queryClient = useQueryClient()
  const [food, setFood] = useState('')
  const [mealTime, setMealTime] = useState('breakfast')

  const logMutation = useMutation({
    mutationFn: (payload) => dietApiClient.logFood(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet', 'logs'] })
      setFood('')
    },
  })

  function handleLogFood(e) {
    e.preventDefault()
    logMutation.mutate({
      food,
      mealTime,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleLogFood}>
      <input
        type="text"
        value={food}
        onChange={(e) => setFood(e.target.value)}
        placeholder="What did you eat?"
        required
      />
      <select value={mealTime} onChange={(e) => setMealTime(e.target.value)}>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>
      <button type="submit" disabled={logMutation.isPending}>
        Log Food
      </button>
    </form>
  )
}
```

---

## Disease & Symptoms

### Symptom Search

```javascript
// File: src/features/search/pages/SymptomSearch.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchApiClient } from '@core/services/api/searchApiClient'

export function SymptomSearchPage() {
  const [query, setQuery] = useState('')

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', 'symptoms', query],
    queryFn: () => searchApiClient.symptoms(query),
    enabled: query.length > 2,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search symptoms"
      />
      {isLoading && <div>Searching...</div>}
      <ul>
        {results?.map(result => (
          <li key={result.id}>
            <strong>{result.name}</strong>
            <p>{result.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Fetch Disease Details

```javascript
// File: src/features/disease/hooks/useDisease.js
import { useQuery } from '@tanstack/react-query'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'

export function useDiseaseDetail(id) {
  return useQuery({
    queryKey: ['disease', id],
    queryFn: () => diseaseApiClient.get(id),
    enabled: !!id,
  })
}
```

---

## Chat & Consultation

### Fetch Chat Conversations

```javascript
// File: src/features/chat/hooks/useChat.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApiClient } from '@core/services/api/chatApiClient'

export function useChatConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => chatApiClient.listConversations(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useChatMessages(conversationId) {
  return useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => chatApiClient.getMessages(conversationId),
    enabled: !!conversationId,
  })
}
```

### Send Chat Message

```javascript
// File: src/features/chat/pages/ChatConversationPage.jsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApiClient } from '@core/services/api/chatApiClient'
import { useState } from 'react'

export function ChatConversationPage({ conversationId }) {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')

  const sendMutation = useMutation({
    mutationFn: (payload) =>
      chatApiClient.sendMessage(conversationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', conversationId],
      })
      setMessage('')
    },
  })

  function handleSend(e) {
    e.preventDefault()
    if (!message.trim()) return

    sendMutation.mutate({
      content: message,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSend}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        rows="4"
      />
      <button type="submit" disabled={sendMutation.isPending || !message.trim()}>
        Send
      </button>
    </form>
  )
}
```

---

## OCR & Prescription Scanning

### Scan Prescription

```javascript
// File: src/features/ocr/pages/PrescriptionScan.jsx
import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ocrApiClient } from '@core/services/api/ocrApiClient'

export function PrescriptionScanPage() {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  const scanMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('image', file)
      return ocrApiClient.scan(formData)
    },
    onSuccess: (result) => {
      console.log('OCR Result:', result)
    },
  })

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => setPreview(event.target?.result)
    reader.readAsDataURL(file)

    scanMutation.mutate(file)
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Scan Prescription
      </button>

      {preview && <img src={preview} alt="Prescription" style={{ maxWidth: '300px' }} />}
      {scanMutation.isPending && <div>Scanning...</div>}
      {scanMutation.error && <div>Error: {scanMutation.error.message}</div>}
    </div>
  )
}
```

---

## Summary

이 가이드는 SilverCare 프로젝트의 프론트엔드에서 백엔드 API와 연동하는 방법을 설명합니다. 모든 코드 예제는 실제 프로젝트 구조에 맞게 작성되었으며, React Query를 이용한 최신 패턴을 따릅니다.
