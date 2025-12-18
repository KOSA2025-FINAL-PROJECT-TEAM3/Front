import { forwardRef, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Slide from '@mui/material/Slide'
import { useLocation, useNavigate } from 'react-router-dom'

import { useSearchOverlayStore } from '@features/search/store/searchOverlayStore'
import { useSearchHistoryStore } from '@features/search/store/searchHistoryStore'
import { PillSearchTab } from '@features/search/components/PillSearchTab'
import { DietSearchTab } from '@features/search/components/DietSearchTab'
import { ROUTE_PATHS } from '@config/routes.config'

const TransitionUp = forwardRef(function TransitionUp(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export const SearchOverlay = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const { isOpen, activeTab, openSeq, close, setActiveTab } = useSearchOverlayStore((state) => ({
    isOpen: state.isOpen,
    activeTab: state.activeTab,
    openSeq: state.openSeq,
    close: state.close,
    setActiveTab: state.setActiveTab,
  }))

  const { history, clearAll, requestSearch, clearPending } = useSearchHistoryStore((state) => ({
    history: state.history,
    clearAll: state.clearAll,
    requestSearch: state.requestSearch,
    clearPending: state.clearPending,
  }))

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const overlayTitle = activeTab === 'pill' ? '약 검색' : '식단'

  const recent = useMemo(() => (Array.isArray(history) ? history : []), [history])

  const handleClose = () => {
    clearPending()
    close()
  }

  const RecentSection = (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
          최근 검색어
        </Typography>
        {recent.length > 0 ? (
          <Button
            variant="text"
            onClick={() => clearAll()}
            sx={{ fontSize: 12, fontWeight: 900, color: 'text.disabled' }}
          >
            전체 삭제
          </Button>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
        {recent.slice(0, 10).map((item) => (
          <Chip
            key={item.id}
            label={item.term}
            onClick={() => requestSearch(activeTab, item.term, 'default')}
            sx={{ fontWeight: 800 }}
          />
        ))}
        {recent.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            최근 검색 기록이 없습니다.
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  )

  return (
    <Dialog
      open={isOpen}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return
        if (reason === 'escapeKeyDown') handleClose()
      }}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
      TransitionComponent={TransitionUp}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton aria-label="뒤로" onClick={() => handleClose()}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton aria-label="닫기" onClick={() => handleClose()}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 900, textAlign: 'center' }}>
            {overlayTitle}
          </Typography>
          <Box sx={{ width: 80 }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2.25}>
          <Box>
            <Tabs
              value={activeTab}
              onChange={(_, nextValue) => setActiveTab(nextValue)}
              aria-label="검색 탭"
              variant="fullWidth"
            >
              <Tab value="pill" label="약" />
              <Tab value="diet" label="식단" />
            </Tabs>
          </Box>

          <Box sx={{ pt: 0.5 }}>
            {activeTab === 'pill' ? (
              <PillSearchTab
                key={`pill-${openSeq}`}
                autoFocus
                layout="overlay"
                recentSection={RecentSection}
                onOpenOcr={() => {
                  handleClose()
                  navigate(ROUTE_PATHS.ocrScan, {
                    state: { returnTo: `${location.pathname}${location.search || ''}` },
                  })
                }}
              />
            ) : (
              <DietSearchTab
                key={`diet-${openSeq}`}
                autoFocus
                layout="overlay"
                recentSection={RecentSection}
                onRequestClose={handleClose}
              />
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default SearchOverlay
