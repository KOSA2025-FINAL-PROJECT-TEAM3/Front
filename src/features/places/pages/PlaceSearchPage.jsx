import { Box, Button, Chip, Divider, Paper, Stack, Tab, Tabs, TextField, Typography, Alert } from '@mui/material'
import { useFocusModeStore } from '@shared/stores/focusModeStore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadKakaoMaps } from '../kakao/loadKakaoMaps'
import { useAuth } from '@features/auth/hooks/useAuth'
import { STORAGE_KEYS } from '@config/constants'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import AppDialog from '@shared/components/mui/AppDialog'
import AppButton from '@shared/components/mui/AppButton'
import DiseaseForm from '@features/disease/components/DiseaseForm'
import PhoneIcon from '@mui/icons-material/Phone'
import MainLayout from '@shared/components/layout/MainLayout'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'

const CATEGORY = {
  hospital: { label: '병원', code: 'HP8' },
  pharmacy: { label: '약국', code: 'PM9' },
}

const getAddress = (place) => place.road_address_name || place.address_name || ''

const sanitizeTelHref = (raw) => {
  const value = String(raw || '').trim()
  if (!value) return ''
  return value.replace(/[^0-9+]/g, '')
}

const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.USER_DATA)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const getUserIdFromUser = (user) => user?.id ?? user?.userId ?? null

const normalizeKeyword = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()

const extractKeywordCandidatesFromDiseaseName = (name) => {
  const cleaned = normalizeKeyword(name)
    .replace(/\(.*?\)/g, ' ')
    .replace(/[·]/g, ' ')

  const parts = cleaned
    .split(/[,/]/g)
    .map((p) => normalizeKeyword(p))
    .filter(Boolean)

  const keywords = new Set()
  for (const part of parts) {
    keywords.add(part)
    if (part.length >= 3) {
      keywords.add(part.replace(/\s/g, ''))
    }
  }
  return Array.from(keywords)
}

const buildRecommendationKeywordOptionsFromDiseases = (diseases) => {
  const names = (Array.isArray(diseases) ? diseases : [])
    .map((d) => String(d?.name || '').trim())
    .filter(Boolean)

  const keywords = new Set()

  for (const name of names) {
    for (const candidate of extractKeywordCandidatesFromDiseaseName(name)) {
      keywords.add(candidate)
    }
  }

  return Array.from(keywords)
    .map((k) => normalizeKeyword(k))
    .filter(Boolean)
    .slice(0, 16)
}

export const PlaceSearchPage = () => {
  const { user } = useAuth((state) => ({ user: state.user }))
  const enterFocusMode = useFocusModeStore((state) => state.enterFocusMode)
  const exitFocusMode = useFocusModeStore((state) => state.exitFocusMode)

  const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const infoWindowRef = useRef(null)
  const placesRef = useRef(null)
  const kakaoRef = useRef(null)
  const myLocationMarkerRef = useRef(null)
  const myLocationOverlayRef = useRef(null)
  const centerListenerAttachedRef = useRef(false)
  const lastSearchByTabRef = useRef({
    hospital: { type: 'category', payload: { mode: 'center' } },
    pharmacy: { type: 'category', payload: { mode: 'center' } },
  })

  const [tab, setTab] = useState('hospital')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('idle') // idle | loadingSdk | ready | searching | error
  const [error, setError] = useState('')
  const [coords, setCoords] = useState(null)
  const [centerCoords, setCenterCoords] = useState(null)
  const [results, setResults] = useState([])
  const [recommendationKeywords, setRecommendationKeywords] = useState([])
  const [isRecommending, setIsRecommending] = useState(false)
  const [showKeywordPicker, setShowKeywordPicker] = useState(false)
  const [keywordOptions, setKeywordOptions] = useState([])
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [showDiseaseForm, setShowDiseaseForm] = useState(false)
  const [diseaseSubmitting, setDiseaseSubmitting] = useState(false)
  const authUserId = useMemo(() => getUserIdFromUser(user), [user])

  useEffect(() => {
    enterFocusMode('map')
    return () => exitFocusMode('map')
  }, [enterFocusMode, exitFocusMode])

  const clearMarkers = useCallback(() => {
    for (const marker of markersRef.current) {
      try {
        marker.setMap(null)
      } catch {
        // ignore
      }
    }
    markersRef.current = []
  }, [])

  const setCenter = useCallback((lat, lng) => {
    if (!kakaoRef.current || !mapRef.current) return
    const pos = new kakaoRef.current.maps.LatLng(lat, lng)
    mapRef.current.setCenter(pos)
  }, [])

  const setMyLocationMarker = useCallback((lat, lng) => {
    const kakao = kakaoRef.current
    if (!kakao || !mapRef.current) return

    const position = new kakao.maps.LatLng(lat, lng)

    if (!myLocationMarkerRef.current) {
      myLocationMarkerRef.current = new kakao.maps.Marker({
        position,
        zIndex: 4,
      })
      myLocationMarkerRef.current.setMap(mapRef.current)
    } else {
      myLocationMarkerRef.current.setPosition(position)
      myLocationMarkerRef.current.setMap(mapRef.current)
    }

    const content =
      '<div style="padding:6px 8px;border-radius:10px;background:rgba(25,118,210,0.92);color:white;font-weight:900;font-size:12px;line-height:1;">내 위치</div>'

    if (!myLocationOverlayRef.current) {
      myLocationOverlayRef.current = new kakao.maps.CustomOverlay({
        position,
        content,
        yAnchor: 1.8,
        zIndex: 5,
      })
      myLocationOverlayRef.current.setMap(mapRef.current)
    } else {
      myLocationOverlayRef.current.setPosition(position)
      myLocationOverlayRef.current.setContent(content)
      myLocationOverlayRef.current.setMap(mapRef.current)
    }
  }, [])

  const waitForMapIdle = useCallback(() => {
    const kakao = kakaoRef.current
    if (!kakao || !mapRef.current) return Promise.resolve()

    return new Promise((resolve) => {
      const handler = () => {
        try {
          kakao.maps.event.removeListener(mapRef.current, 'idle', handler)
        } catch {
          // ignore
        }
        resolve()
      }
      kakao.maps.event.addListener(mapRef.current, 'idle', handler)
    })
  }, [])

  const ensureMap = useCallback(async () => {
    if (!kakaoKey) {
      setStatus('error')
      setError('VITE_KAKAO_JAVASCRIPT_KEY가 설정되어 있지 않습니다.')
      return null
    }

    if (mapRef.current && kakaoRef.current && placesRef.current) return kakaoRef.current

    setStatus('loadingSdk')
    setError('')
    try {
      const kakao = await loadKakaoMaps(kakaoKey)
      kakaoRef.current = kakao

      if (!containerRef.current) {
        setStatus('error')
        setError('지도 컨테이너를 찾을 수 없습니다.')
        return null
      }

      if (!mapRef.current) {
        const initialCenter = new kakao.maps.LatLng(37.5665, 126.978) // Seoul
        mapRef.current = new kakao.maps.Map(containerRef.current, {
          center: initialCenter,
          level: 5,
        })
        infoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 2 })
        placesRef.current = new kakao.maps.services.Places()
      }

      if (!centerListenerAttachedRef.current && mapRef.current) {
        centerListenerAttachedRef.current = true

        try {
          const c = mapRef.current.getCenter()
          setCenterCoords({ lat: c.getLat(), lng: c.getLng() })
        } catch {
          // ignore
        }

        kakao.maps.event.addListener(mapRef.current, 'center_changed', () => {
          try {
            const c = mapRef.current.getCenter()
            setCenterCoords({ lat: c.getLat(), lng: c.getLng() })
          } catch {
            // ignore
          }
        })
      }

      setStatus('ready')
      return kakao
    } catch (e) {
      setStatus('error')
      setError(e?.message || 'Kakao Maps SDK 로드 실패')
      return null
    }
  }, [kakaoKey])

  const ensureMyLocation = useCallback(async () => {
    const kakao = await ensureMap()
    if (!kakao) return null

    if (coords?.lat && coords?.lng) {
      setCenter(coords.lat, coords.lng)
      setMyLocationMarker(coords.lat, coords.lng)
      await waitForMapIdle()
      return coords
    }

    if (!navigator.geolocation) {
      setError('이 기기/브라우저에서는 위치 정보를 지원하지 않습니다.')
      return null
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setCoords(next)
          setCenter(next.lat, next.lng)
          setMyLocationMarker(next.lat, next.lng)
          await waitForMapIdle()
          resolve(next)
        },
        (err) => {
          setError(err?.message || '위치 정보를 가져오지 못했습니다.')
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 8000 },
      )
    })
  }, [coords, ensureMap, setCenter, setMyLocationMarker, waitForMapIdle])

  const mapCenter = useCallback(() => {
    if (!kakaoRef.current || !mapRef.current) return null
    const c = mapRef.current.getCenter()
    return { lat: c.getLat(), lng: c.getLng() }
  }, [])

  const showResultsOnMap = useCallback(
    (places) => {
      const kakao = kakaoRef.current
      if (!kakao || !mapRef.current) return

      clearMarkers()

      const bounds = new kakao.maps.LatLngBounds()
      const markers = []

      for (const place of places) {
        const lat = Number(place.y)
        const lng = Number(place.x)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

        const position = new kakao.maps.LatLng(lat, lng)
        const marker = new kakao.maps.Marker({ position })
        marker.setMap(mapRef.current)

        kakao.maps.event.addListener(marker, 'click', () => {
          infoWindowRef.current?.setContent(
            `<div style="padding:8px 10px;font-size:12px;line-height:1.3;"><strong>${place.place_name}</strong><br/>${getAddress(place)}</div>`,
          )
          infoWindowRef.current?.open(mapRef.current, marker)
        })

        markers.push(marker)
        bounds.extend(position)
      }

      markersRef.current = markers
      if (places.length > 0) {
        mapRef.current.setBounds(bounds)
      }
    },
    [clearMarkers],
  )

  const searchByCategory = useCallback(async () => {
    const kakao = await ensureMap()
    if (!kakao || !placesRef.current) return

    lastSearchByTabRef.current[tab] = { type: 'category', payload: { mode: 'center' } }

    setStatus('searching')
    setError('')

    const center = mapCenter()
    const categoryCode = CATEGORY[tab].code

    placesRef.current.categorySearch(
      categoryCode,
      (data, searchStatus) => {
        if (searchStatus === kakao.maps.services.Status.OK) {
          setResults(data || [])
          showResultsOnMap(data || [])
          setStatus('ready')
          return
        }

        if (searchStatus === kakao.maps.services.Status.ZERO_RESULT) {
          setResults([])
          clearMarkers()
          setStatus('ready')
          return
        }

        setResults([])
        clearMarkers()
        setStatus('error')
        setError('주변 검색에 실패했습니다.')
      },
      center
        ? { location: new kakao.maps.LatLng(center.lat, center.lng), radius: 3000, sort: kakao.maps.services.SortBy.DISTANCE }
        : { radius: 3000, sort: kakao.maps.services.SortBy.DISTANCE },
    )
  }, [clearMarkers, ensureMap, mapCenter, showResultsOnMap, tab])

  const searchByKeyword = useCallback(async () => {
    const keyword = query.trim()
    if (!keyword) {
      searchByCategory()
      return
    }

    const kakao = await ensureMap()
    if (!kakao || !placesRef.current) return

    lastSearchByTabRef.current[tab] = { type: 'keyword', payload: { query: keyword } }

    setStatus('searching')
    setError('')

    const center = mapCenter()

    placesRef.current.keywordSearch(
      keyword,
      (data, searchStatus) => {
        if (searchStatus === kakao.maps.services.Status.OK) {
          const filtered = (data || []).filter((p) => {
            const categoryName = String(p.category_name || '')
            return tab === 'pharmacy' ? categoryName.includes('약국') : categoryName.includes('병원')
          })
          setResults(filtered)
          showResultsOnMap(filtered)
          setStatus('ready')
          return
        }

        if (searchStatus === kakao.maps.services.Status.ZERO_RESULT) {
          setResults([])
          clearMarkers()
          setStatus('ready')
          return
        }

        setResults([])
        clearMarkers()
        setStatus('error')
        setError('키워드 검색에 실패했습니다.')
      },
      center ? { location: new kakao.maps.LatLng(center.lat, center.lng), radius: 5000 } : undefined,
    )
  }, [clearMarkers, ensureMap, mapCenter, query, searchByCategory, showResultsOnMap, tab])

  const runHospitalRecommendationSearch = useCallback(
    async (keywords) => {
      const normalized = (Array.isArray(keywords) ? keywords : []).map(normalizeKeyword).filter(Boolean)
      if (normalized.length === 0) {
        setStatus('error')
        setError('추천에 사용할 키워드를 선택해주세요.')
        return
      }

      lastSearchByTabRef.current.hospital = { type: 'recommendation', payload: { keywords: normalized } }

      setIsRecommending(true)
      setError('')
      try {
        const kakao = await ensureMap()
        if (!kakao || !placesRef.current) return

        setStatus('searching')
        const center = mapCenter()
        const options = center
          ? {
              location: new kakao.maps.LatLng(center.lat, center.lng),
              radius: 5000,
              category_group_code: CATEGORY.hospital.code,
              sort: kakao.maps.services.SortBy.DISTANCE,
            }
          : { radius: 5000, category_group_code: CATEGORY.hospital.code }

        const keywordSearchAsync = (keyword) =>
          new Promise((resolve) => {
            placesRef.current.keywordSearch(
              keyword,
              (data, searchStatus) => {
                if (searchStatus !== kakao.maps.services.Status.OK) {
                  resolve([])
                  return
                }
                resolve(data || [])
              },
              options,
            )
          })

        const batches = await Promise.all(normalized.map((k) => keywordSearchAsync(k)))
        const merged = batches.flat()

        const deduped = []
        const seen = new Set()
        for (const item of merged) {
          if (!item?.id || seen.has(item.id)) continue
          seen.add(item.id)
          deduped.push(item)
        }

        setRecommendationKeywords(normalized)
        setResults(deduped)
        showResultsOnMap(deduped)
        setStatus('ready')
      } catch (e) {
        setStatus('error')
        setError(e?.message || '질환 기반 병원 추천에 실패했습니다.')
      } finally {
        setIsRecommending(false)
      }
    },
    [ensureMap, mapCenter, showResultsOnMap],
  )

  const rerunLastSearch = useCallback(async () => {
    const last = lastSearchByTabRef.current[tab] ?? { type: 'category', payload: { mode: 'center' } }
    if (!last?.type) return

    if (last.type === 'keyword') {
      await searchByKeyword()
      return
    }

    if (last.type === 'recommendation') {
      await runHospitalRecommendationSearch(last.payload?.keywords || [])
      return
    }

    await searchByCategory()
  }, [runHospitalRecommendationSearch, searchByCategory, searchByKeyword, tab])

  const openDiseaseKeywordPicker = useCallback(async () => {
    setError('')

    const storedUser = getStoredUser()
    const userId = getUserIdFromUser(user) ?? getUserIdFromUser(storedUser)
    if (!userId) {
      setStatus('error')
      setError('로그인 정보를 확인할 수 없습니다.')
      return
    }

    setIsRecommending(true)
    try {
      const diseases = await diseaseApiClient.listByUser(userId)
      const options = buildRecommendationKeywordOptionsFromDiseases(diseases)

      if (options.length === 0) {
        setShowDiseaseForm(true)
        return
      }

      setKeywordOptions(options)
      setSelectedKeywords(options.slice(0, 6))
      setShowKeywordPicker(true)
    } catch (e) {
      setStatus('error')
      setError(e?.message || '질환 정보를 불러오지 못했습니다.')
    } finally {
      setIsRecommending(false)
    }
  }, [user])

  const handleSubmitDisease = useCallback(
    async (payload) => {
      setDiseaseSubmitting(true)
      try {
        await diseaseApiClient.create(payload)
        setShowDiseaseForm(false)
        await openDiseaseKeywordPicker()
      } catch (e) {
        setStatus('error')
        setError(e?.message || '질환 등록에 실패했습니다.')
      } finally {
        setDiseaseSubmitting(false)
      }
    },
    [openDiseaseKeywordPicker],
  )

  const requestLocation = useCallback(() => {
    setError('')
    if (!navigator.geolocation) {
      setError('이 기기/브라우저에서는 위치 정보를 지원하지 않습니다.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(next)
        setCenter(next.lat, next.lng)
        setMyLocationMarker(next.lat, next.lng)
        ;(async () => {
          await waitForMapIdle()
          await rerunLastSearch()
        })()
      },
      (err) => {
        setError(err?.message || '위치 정보를 가져오지 못했습니다.')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [rerunLastSearch, setCenter, setMyLocationMarker, waitForMapIdle])

  useEffect(() => {
    const BIG_HOSPITAL_KEYWORDS = ['상급종합병원', '대학교병원', '대학병원', '종합병원']

    const runDefaultForHospital = async () => {
      setError('')
      await ensureMyLocation()

      const storedUser = getStoredUser()
      const userId = authUserId ?? getUserIdFromUser(storedUser)

      let diseases = []
      if (userId) {
        try {
          diseases = await diseaseApiClient.listByUser(userId)
        } catch {
          diseases = []
        }
      }

      const diseaseKeywords = buildRecommendationKeywordOptionsFromDiseases(diseases)
        .sort((a, b) => b.length - a.length)
        .slice(0, 6)

      if (diseaseKeywords.length > 0) {
        await runHospitalRecommendationSearch(diseaseKeywords)
        return
      }

      await runHospitalRecommendationSearch(BIG_HOSPITAL_KEYWORDS)
    }

    const runDefaultForPharmacy = async () => {
      setRecommendationKeywords([])
      await ensureMyLocation()
      await searchByCategory()
    }

    if (tab === 'hospital') {
      void runDefaultForHospital()
      return
    }

    void runDefaultForPharmacy()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authUserId])

  const selectedCategoryLabel = useMemo(() => CATEGORY[tab].label, [tab])

  return (
    <MainLayout>
      <>
        <PageStack>
          <PageHeader leading={<BackButton />} title="병원/약국" subtitle={`Kakao Maps 기반 주변 ${selectedCategoryLabel} 검색`} />

          {!kakaoKey ? (
            <Alert severity="warning">
              `VITE_KAKAO_JAVASCRIPT_KEY`가 필요합니다. (`Front/.env.template` 참고)
            </Alert>
          ) : null}

          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="fullWidth">
              <Tab value="hospital" label="병원" />
              <Tab value="pharmacy" label="약국" />
            </Tabs>
            <Divider />

            <Box sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="이름/주소 키워드 검색"
                    size="small"
                    fullWidth
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        searchByKeyword()
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={searchByKeyword}
                    disabled={!kakaoKey || status === 'loadingSdk' || status === 'searching'}
                    sx={{ fontWeight: 900, minWidth: 110 }}
                  >
                    검색
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={searchByCategory}
                    disabled={!kakaoKey || status === 'loadingSdk' || status === 'searching'}
                    sx={{ fontWeight: 900, minWidth: 140 }}
                  >
                    현재 지도 위치 중심으로 찾기
                  </Button>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                  <Button
                    variant="outlined"
                    onClick={requestLocation}
                    disabled={!kakaoKey || status === 'loadingSdk' || status === 'searching' || isRecommending}
                    sx={{ fontWeight: 900 }}
                  >
                    내 위치로 이동
                  </Button>
                  {tab === 'hospital' ? (
                    <Button
                      variant="contained"
                      onClick={openDiseaseKeywordPicker}
                      disabled={!kakaoKey || status === 'loadingSdk' || status === 'searching' || isRecommending}
                      sx={{ fontWeight: 900 }}
                    >
                      내 질환 기반 추천
                    </Button>
                  ) : null}
                  {coords ? <Chip size="small" label={`현재 위치: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`} /> : null}
                  {centerCoords ? (
                    <Chip size="small" label={`이 위치 중심 탐색: ${centerCoords.lat.toFixed(5)}, ${centerCoords.lng.toFixed(5)}`} />
                  ) : null}
                  {tab === 'hospital' && recommendationKeywords.length > 0 ? (
                    <Chip
                      size="small"
                      label={`추천 키워드: ${recommendationKeywords.slice(0, 3).join(', ')}${recommendationKeywords.length > 3 ? '…' : ''}`}
                    />
                  ) : null}
                  {status === 'loadingSdk' ? (
                    <Chip size="small" label="지도 로딩 중..." />
                  ) : status === 'searching' ? (
                    <Chip size="small" label="검색 중..." />
                  ) : isRecommending ? (
                    <Chip size="small" label="추천 중..." />
                  ) : null}
                </Stack>

                {error ? <Alert severity={status === 'error' ? 'error' : 'warning'}>{error}</Alert> : null}

                <Box
                  sx={{
                    width: '100%',
                    height: 320,
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: 'grey.100',
                    border: 1,
                    borderColor: 'divider',
                    position: 'relative',
                  }}
                >
                  <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        bgcolor: 'warning.main',
                        border: '2px solid white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                      }}
                    />
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: 'rgba(0,0,0,0.65)',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      이 위치 중심 탐색
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    결과 ({results.length})
                  </Typography>
                  <Stack spacing={1}>
                    {results.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        검색 결과가 없습니다.
                      </Typography>
                    ) : (
                      results.slice(0, 30).map((item) => (
                        <Paper
                          key={item.id}
                          variant="outlined"
                          sx={{ p: 1.5, borderRadius: 3, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
                          onClick={() => {
                            const lat = Number(item.y)
                            const lng = Number(item.x)
                            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                              setCenter(lat, lng)
                            }
                          }}
                        >
                          <Stack spacing={0.25}>
                            <Typography sx={{ fontWeight: 900 }}>{item.place_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getAddress(item)}
                            </Typography>
                            {item.phone ? (
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {item.phone}
                                </Typography>
                                <AppButton
                                  variant="secondary"
                                  size="sm"
                                  component="a"
                                  href={`tel:${sanitizeTelHref(item.phone)}`}
                                  onClick={(e) => e.stopPropagation()}
                                  startIcon={<PhoneIcon fontSize="small" />}
                                  sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}
                                >
                                  전화
                                </AppButton>
                              </Stack>
                            ) : null}
                          </Stack>
                        </Paper>
                      ))
                    )}
                  </Stack>
                  {results.length > 30 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      목록은 최대 30개까지 표시합니다(지도에는 전체 결과가 표시될 수 있음).
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            </Box>
          </Paper>
        </PageStack>

        <AppDialog
          isOpen={showKeywordPicker}
          title="내 질환 기반 추천"
          description="등록된 질환명에서 추천 검색에 사용할 키워드를 선택하세요. (예: 고혈압, 고지혈증)"
          onClose={() => setShowKeywordPicker(false)}
          maxWidth="sm"
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {keywordOptions.map((keyword) => {
                const selected = selectedKeywords.includes(keyword)
                return (
                  <Chip
                    key={keyword}
                    label={keyword}
                    clickable
                    onClick={() => {
                      setSelectedKeywords((prev) =>
                        prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword],
                      )
                    }}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 800 }}
                  />
                )
              })}
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <AppButton variant="ghost" onClick={() => setShowKeywordPicker(false)}>
                취소
              </AppButton>
              <AppButton
                variant="secondary"
                onClick={() => setSelectedKeywords(keywordOptions.slice(0, 6))}
                disabled={keywordOptions.length === 0}
              >
                기본 선택
              </AppButton>
              <AppButton
                variant="primary"
                loading={isRecommending}
                onClick={async () => {
                  setShowKeywordPicker(false)
                  await runHospitalRecommendationSearch(selectedKeywords)
                }}
              >
                추천 검색
              </AppButton>
            </Stack>
          </Stack>
        </AppDialog>

        <AppDialog
          isOpen={showDiseaseForm}
          title="질환 추가"
          description="등록된 질환이 없어 추천을 할 수 없습니다. 질환을 추가해주세요."
          onClose={() => setShowDiseaseForm(false)}
          maxWidth="sm"
        >
          <DiseaseForm onSubmit={handleSubmitDisease} onCancel={() => setShowDiseaseForm(false)} submitting={diseaseSubmitting} />
        </AppDialog>
      </>
    </MainLayout>
  )
}

export default PlaceSearchPage
