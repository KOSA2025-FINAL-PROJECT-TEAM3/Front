import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Box,
    CircularProgress,
    IconButton,
    Chip,
    Stack,
    Alert,
    AlertTitle
} from '@mui/material';

// Fallback icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const DietAnalysisModal = ({ isOpen, onClose, analysisResult, onSave, isLoading }) => {
    const [editedResult, setEditedResult] = useState(null);

    useEffect(() => {
        if (analysisResult) {
            setEditedResult(analysisResult);
        }
    }, [analysisResult]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedResult(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        onSave(editedResult);
    };

    if (!isOpen) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" fontWeight="bold">음식 분석 결과</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                        <CircularProgress size={48} sx={{ mb: 2 }} />
                        <Typography color="text.secondary">음식을 분석하는 중...</Typography>
                    </Box>
                ) : editedResult ? (
                    <Stack spacing={3} sx={{ py: 1 }}>
                        {/* Overall Safety Level */}
                        {editedResult.overallLevel && (
                            <Alert
                                severity={
                                    editedResult.overallLevel === 'GOOD' ? 'success' :
                                        editedResult.overallLevel === 'WARNING' ? 'warning' : 'error'
                                }
                                icon={false}
                                sx={{ borderRadius: 2 }}
                            >
                                <AlertTitle sx={{ fontWeight: 'bold' }}>
                                    {editedResult.overallLevel === 'GOOD' ? '안전' : editedResult.overallLevel === 'WARNING' ? '주의' : '경고'}
                                </AlertTitle>
                                {editedResult.summary || '분석 결과가 준비되었습니다.'}
                            </Alert>
                        )}

                        {/* Food Name */}
                        <TextField
                            label="인식된 음식"
                            name="foodName"
                            value={editedResult.foodName || ''}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />

                        {/* Drug Interactions */}
                        {editedResult.drugInteractions && editedResult.drugInteractions.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">약물 상호작용</Typography>
                                <Stack spacing={1}>
                                    {editedResult.drugInteractions.map((interaction, idx) => (
                                        <Box key={idx} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                            <Typography variant="subtitle2" color="text.primary">{interaction.medicationName}</Typography>
                                            <Typography variant="body2" color="text.secondary">{interaction.description}</Typography>
                                            {interaction.recommendation && (
                                                <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                                                    권장: {interaction.recommendation}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Disease Interactions */}
                        {editedResult.diseaseInteractions && editedResult.diseaseInteractions.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">질병 관련 주의사항</Typography>
                                <Stack spacing={1}>
                                    {editedResult.diseaseInteractions.map((interaction, idx) => (
                                        <Box key={idx} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                            <Typography variant="subtitle2" color="text.primary">{interaction.diseaseName}</Typography>
                                            <Typography variant="body2" color="text.secondary">{interaction.description}</Typography>
                                            {interaction.recommendation && (
                                                <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                                                    권장: {interaction.recommendation}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Meal Type */}
                        <FormControl fullWidth>
                            <InputLabel>식사 구분</InputLabel>
                            <Select
                                name="mealType"
                                value={editedResult.mealType || 'breakfast'}
                                onChange={handleChange}
                                label="식사 구분"
                            >
                                <MenuItem value="breakfast">아침</MenuItem>
                                <MenuItem value="lunch">점심</MenuItem>
                                <MenuItem value="dinner">저녁</MenuItem>
                                <MenuItem value="snack">간식</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        분석 결과가 없습니다.
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                    취소
                </Button>
                {editedResult && (
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        startIcon={<CheckIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        확인 및 저장
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DietAnalysisModal;
