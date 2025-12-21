import { forwardRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Box,
    Slide,
    useMediaQuery,
    useTheme
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MealInputForm from './MealInputForm'
import { dietApiClient } from '@core/services/api/dietApiClient'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export const DietEntryModal = ({ open, onClose }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleAddMeal = async (mealData) => {
        try {
            await dietApiClient.addDietLog(mealData)
            toast.success('식단이 등록되었습니다.')
            onClose()
        } catch (error) {
            logger.error('Failed to add diet log via modal:', error)
            toast.error('식단 등록에 실패했습니다.')
        }
    }

    // Dummy update handler (shouldn't be called in add mode)
    const handleUpdateMeal = async () => { }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Transition}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : 4,
                    bgcolor: 'background.default'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
                <Typography variant="h6" component="span" fontWeight="bold">
                    식단 기록
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                <Box sx={{ p: 2 }}>
                    <MealInputForm
                        onAddMeal={handleAddMeal}
                        onUpdateMeal={handleUpdateMeal}
                        isModal={true}
                        onCancelEdit={onClose}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default DietEntryModal
