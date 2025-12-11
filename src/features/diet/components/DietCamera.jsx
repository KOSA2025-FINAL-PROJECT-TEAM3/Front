import React, { useRef, useState } from 'react';
import { Box, Button, IconButton, Typography, Paper } from '@mui/material';
import { CameraAlt, CloudUpload, Close } from '@mui/icons-material';

// Fallback icons if @mui/icons-material is not installed
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const DietCamera = React.forwardRef(({ onImageCapture, initialPreview = null }, ref) => {
    const galleryInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);

    // 초기 프리뷰 동기화 (기존 이미지 표시용)
    React.useEffect(() => {
        if (initialPreview) {
            setPreview(initialPreview);
        } else {
            setPreview(null);
        }
    }, [initialPreview]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            onImageCapture(file, reader.result);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setPreview(null);
        if (galleryInputRef.current) galleryInputRef.current.value = '';
        onImageCapture(null, null);
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setIsCameraOpen(true);
            // Wait for state update and ref to be attached
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob/file
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    processFile(file);
                    stopCamera();
                }
            }, 'image/jpeg', 0.8);
        }
    };

    // 외부에서 초기화할 수 있도록 ref 노출
    React.useImperativeHandle(ref, () => ({
        clear: clearImage
    }));

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {/* Hidden Gallery Input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                style={{ display: 'none' }}
                ref={galleryInputRef}
                onChange={handleFileChange}
            />

            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {isCameraOpen ? (
                <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '75%', // 4:3 Aspect Ratio
                        bgcolor: 'black',
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={stopCamera}
                            sx={{ borderRadius: 2 }}
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            onClick={capturePhoto}
                            startIcon={<CameraIcon />}
                            sx={{ borderRadius: 2, px: 3 }}
                        >
                            촬영
                        </Button>
                    </Box>
                </Box>
            ) : preview ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                    <Box
                        component="img"
                        src={preview}
                        alt="Food Preview"
                        sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 3,
                            boxShadow: 3
                        }}
                    />
                    <IconButton
                        onClick={clearImage}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'white',
                            '&:hover': { bgcolor: 'grey.100' },
                            boxShadow: 1
                        }}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                    <Button
                        onClick={startCamera}
                        variant="outlined"
                        sx={{
                            flex: 1,
                            height: 120,
                            borderRadius: 4,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            textTransform: 'none',
                            color: 'text.secondary',
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'primary.50',
                                color: 'primary.main'
                            }
                        }}
                    >
                        <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: '50%', boxShadow: 1, display: 'flex' }}>
                            <CameraIcon />
                        </Box>
                        <Typography variant="body2" fontWeight="medium">사진 촬영</Typography>
                    </Button>

                    <Button
                        onClick={() => galleryInputRef.current?.click()}
                        variant="outlined"
                        sx={{
                            flex: 1,
                            height: 120,
                            borderRadius: 4,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            textTransform: 'none',
                            color: 'text.secondary',
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'primary.50',
                                color: 'primary.main'
                            }
                        }}
                    >
                        <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: '50%', boxShadow: 1, display: 'flex' }}>
                            <UploadIcon />
                        </Box>
                        <Typography variant="body2" fontWeight="medium">사진 업로드</Typography>
                    </Button>
                </Box>
            )}
        </Box>
    );
});

DietCamera.displayName = 'DietCamera';
export default DietCamera;
