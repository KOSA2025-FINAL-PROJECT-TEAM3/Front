import { useState, useCallback, useRef, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Stack,
    Paper,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material'
import {
    Close as CloseIcon,
    Search as SearchIcon,
    MyLocation as MyLocationIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material'
import AppButton from '@shared/components/mui/AppButton'
import { loadKakaoMaps } from '@features/places/kakao/loadKakaoMaps'

/**
 * 병원 검색 모달 컴포넌트
 * 카카오 맵 API를 사용하여 병원 검색 후 선택 가능
 * 
 * @param {boolean} open - 모달 열림 상태
 * @param {() => void} onClose - 모달 닫기 핸들러
 * @param {(hospital: {name, address, phone}) => void} onSelect - 병원 선택 핸들러
 */
export const HospitalSearchModal = ({ open, onClose, onSelect }) => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
    
    const containerRef = useRef(null)
    const mapRef = useRef(null)
    const markersRef = useRef([])
    const placesRef = useRef(null)
    const kakaoRef = useRef(null)
    const infoWindowRef = useRef(null)
    
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [status, setStatus] = useState('idle') // idle | loading | ready | searching | error
    const [error, setError] = useState('')
    
    // 마커 초기화
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
    
    // 지도 초기화
    const ensureMap = useCallback(async () => {
        if (!kakaoKey) {
            setStatus('error')
            setError('VITE_KAKAO_JAVASCRIPT_KEY가 설정되어 있지 않습니다.')
            return null
        }
        
        if (mapRef.current && kakaoRef.current && placesRef.current) return kakaoRef.current
        
        setStatus('loading')
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
            
            setStatus('ready')
            return kakao
        } catch (e) {
            setStatus('error')
            setError(e?.message || 'Kakao Maps SDK 로드 실패')
            return null
        }
    }, [kakaoKey])
    
    // 내 위치로 이동
    const goToMyLocation = useCallback(async () => {
        const kakao = await ensureMap()
        if (!kakao) return
        
        if (!navigator.geolocation) {
            setError('이 기기에서는 위치 정보를 지원하지 않습니다.')
            return
        }
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                const position = new kakao.maps.LatLng(latitude, longitude)
                mapRef.current?.setCenter(position)
            },
            (err) => {
                setError(err?.message || '위치 정보를 가져오지 못했습니다.')
            },
            { enableHighAccuracy: true, timeout: 8000 }
        )
    }, [ensureMap])
    
    // 검색 결과 지도에 표시
    const showResultsOnMap = useCallback((places) => {
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
                    `<div style="padding:8px 10px;font-size:12px;line-height:1.3;"><strong>${place.place_name}</strong><br/>${place.road_address_name || place.address_name}</div>`
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
    }, [clearMarkers])
    
    // 키워드 검색
    const searchByKeyword = useCallback(async () => {
        const keyword = query.trim()
        if (!keyword) {
            setError('검색어를 입력해주세요.')
            return
        }
        
        const kakao = await ensureMap()
        if (!kakao || !placesRef.current) return
        
        setStatus('searching')
        setError('')
        
        const center = mapRef.current?.getCenter()
        const options = center
            ? { location: new kakao.maps.LatLng(center.getLat(), center.getLng()), radius: 5000 }
            : undefined
        
        placesRef.current.keywordSearch(
            keyword,
            (data, searchStatus) => {
                if (searchStatus === kakao.maps.services.Status.OK) {
                    // 병원 카테고리만 필터링
                    const hospitals = (data || []).filter((p) => {
                        const category = String(p.category_name || '')
                        return category.includes('병원') || category.includes('의원') || category.includes('클리닉')
                    })
                    setResults(hospitals)
                    showResultsOnMap(hospitals)
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
                setError('검색에 실패했습니다.')
            },
            options
        )
    }, [query, ensureMap, showResultsOnMap, clearMarkers])
    
    // 병원 선택
    const handleSelectHospital = useCallback((place) => {
        onSelect({
            name: place.place_name,
            address: place.road_address_name || place.address_name || '',
            phone: place.phone || '',
        })
        onClose()
    }, [onSelect, onClose])
    
    // 모달 열릴 때 지도 초기화
    useEffect(() => {
        if (open) {
            // setTimeout으로 DOM 렌더링 후 지도 초기화
            const timer = setTimeout(() => {
                ensureMap()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [open, ensureMap])
    
    // 엔터 키 검색
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            searchByKeyword()
        }
    }
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { height: '80vh', maxHeight: 700 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    병원 검색
                </Typography>
                <IconButton onClick={onClose} edge="end">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                {/* 검색 영역 */}
                <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="병원 이름 검색 (예: 서울대병원)"
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.disabled' }} />,
                            }}
                        />
                        <AppButton
                            variant="primary"
                            onClick={searchByKeyword}
                            disabled={status === 'loading' || status === 'searching'}
                            sx={{ flexShrink: 0, minWidth: 70 }}
                        >
                            검색
                        </AppButton>
                        <IconButton
                            onClick={goToMyLocation}
                            disabled={status === 'loading' || status === 'searching'}
                            sx={{ flexShrink: 0 }}
                        >
                            <MyLocationIcon />
                        </IconButton>
                    </Stack>
                    
                    {error && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
                
                {/* 지도 영역 */}
                <Box
                    sx={{
                        height: 200,
                        bgcolor: 'grey.100',
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        position: 'relative',
                    }}
                >
                    <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
                    {(status === 'loading' || status === 'searching') && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(255,255,255,0.7)',
                            }}
                        >
                            <CircularProgress size={32} />
                        </Box>
                    )}
                </Box>
                
                {/* 결과 목록 */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        검색 결과 ({results.length})
                    </Typography>
                    
                    {results.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            {status === 'ready' ? '검색 결과가 없습니다.' : '병원 이름을 검색해주세요.'}
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {results.slice(0, 20).map((place) => (
                                <Paper
                                    key={place.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                    onClick={() => handleSelectHospital(place)}
                                >
                                    <Stack spacing={0.5}>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            {place.place_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {place.road_address_name || place.address_name}
                                        </Typography>
                                        {place.phone && (
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <PhoneIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                                <Typography variant="body2" color="primary">
                                                    {place.phone}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <AppButton variant="ghost" onClick={onClose}>
                    닫기
                </AppButton>
            </DialogActions>
        </Dialog>
    )
}

export default HospitalSearchModal
