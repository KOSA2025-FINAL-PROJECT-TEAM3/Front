import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'

/**
 * NoFamilyModal - 가족 그룹이 없을 때 표시되는 강제 모달
 * 자동 리다이렉트 타이머 포함
 */
export function NoFamilyModal({ open }) {
    const navigate = useNavigate()
    const [autoRedirectTimer, setAutoRedirectTimer] = useState(10)

    const handleRedirectToFamily = useCallback(() => {
        navigate(ROUTE_PATHS.family)
    }, [navigate])

    useEffect(() => {
        let intervalId
        if (open) {
            setAutoRedirectTimer(10)
            intervalId = setInterval(() => {
                setAutoRedirectTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalId)
                        handleRedirectToFamily()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(intervalId)
    }, [open, handleRedirectToFamily])

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            onClose={(event, reason) => {
                if (reason === 'backdropClick') {
                    handleRedirectToFamily()
                }
            }}
            aria-labelledby="no-family-dialog-title"
        >
            <DialogTitle id="no-family-dialog-title" sx={{ fontWeight: 900 }}>
                가족 그룹이 없습니다
            </DialogTitle>
            <DialogContent>
                <Typography>
                    서비스를 이용하기 위해서는 가족 그룹이 생성되거나 소속되어야 합니다.<br />
                    가족 페이지로 이동하여 그룹을 생성하거나 초대를 확인해주세요.<br />
                    <Typography component="span" color="primary" sx={{ fontWeight: 700, mt: 1, display: 'block' }}>
                        {autoRedirectTimer}초 후 자동으로 이동합니다.
                    </Typography>
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0 }}>
                <Button
                    onClick={handleRedirectToFamily}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ fontWeight: 800 }}
                >
                    가족 그룹 페이지로 이동
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default NoFamilyModal
