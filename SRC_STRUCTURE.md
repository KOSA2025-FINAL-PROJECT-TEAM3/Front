# SilverCare Project Structure (AOP + SOLID Principles)

## 📐 Architecture Overview

This project follows **AOP (Aspect-Oriented Programming)** and **SOLID principles** for maintainable, scalable code.

### SOLID Principles Applied
- **S (Single Responsibility)**: Each module/class handles one responsibility
- **O (Open/Closed)**: Open for extension, closed for modification
- **L (Liskov Substitution)**: Subtypes are substitutable for their base types
- **I (Interface Segregation)**: Client-specific interfaces
- **D (Dependency Inversion)**: Depend on abstractions, not concrete implementations

### AOP Concerns
- **Logging**: Centralized logging aspect
- **Security**: Authentication/Authorization aspects
- **Transaction**: Database transaction management
- **Error Handling**: Global exception handling
- **Performance Monitoring**: Execution time tracking

---

## 🗂️ Project Root Structure

```
silvercare/
├── frontend/                    # React Web Application
├── backend/                     # Spring Boot Application
├── docs/                        # Documentation
│   ├── PROJECT_SPECIFICATION.md
│   ├── src-structure.md
│   ├── api/                     # API documentation
│   └── diagrams/                # Architecture diagrams
├── scripts/                     # Deployment & utility scripts
├── docker/                      # Docker configurations
│   ├── docker-compose.yml
│   ├── frontend.Dockerfile
│   └── backend.Dockerfile
├── .github/                     # GitHub Actions CI/CD
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
└── README.md
```

---

## 🎨 Frontend Structure (React + JSX)

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── main.jsx                         # Application entry point
│   ├── App.jsx                          # Root component
│   │
│   ├── core/                            # Core utilities (DI principle)
│   │   ├── config/
│   │   │   ├── api.config.js           # API base URL, timeout
│   │   │   ├── routes.config.js         # Route definitions
│   │   │   └── constants.js             # Global constants
│   │   │
│   │   ├── services/                    # Business logic layer (SRP)
│   │   │   ├── api/
│   │   │   │   ├── ApiClient.js         # Abstract API client
│   │   │   │   ├── AuthApiClient.js
│   │   │   │   ├── MedicationApiClient.js
│   │   │   │   ├── FamilyApiClient.js
│   │   │   │   ├── DietApiClient.js
│   │   │   │   └── InteractionApiClient.js
│   │   │   │
│   │   │   ├── ocr/
│   │   │   │   ├── IOCRService.js       # Interface (ISP)
│   │   │   │   ├── GoogleVisionOCR.js   # Google Vision implementation
│   │   │   │   ├── TesseractOCR.js      # Tesseract fallback
│   │   │   │   └── OCRServiceFactory.js # Factory pattern (OCP)
│   │   │   │
│   │   │   ├── realtime/
│   │   │   │   ├── HocuspocusProvider.js
│   │   │   │   └── FamilySyncService.js
│   │   │   │
│   │   │   └── storage/
│   │   │       ├── IStorageService.js   # Interface
│   │   │       ├── LocalStorageService.js
│   │   │       └── SessionStorageService.js
│   │   │
│   │   ├── interceptors/                # AOP: Request/Response interceptors
│   │   │   ├── authInterceptor.js       # JWT token injection
│   │   │   ├── loggingInterceptor.js    # Request/Response logging
│   │   │   └── errorInterceptor.js      # Global error handling
│   │   │
│   │   └── utils/                       # Utility functions (SRP)
│   │       ├── dateUtils.js
│   │       ├── validationUtils.js
│   │       ├── imageUtils.js
│   │       └── formatUtils.js
│   │
│   ├── features/                        # Feature-based modules (SRP)
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── SignupForm.jsx
│   │   │   │   └── PasswordReset.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.js
│   │   │   │   └── useLogin.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx
│   │   │   └── pages/
│   │   │       ├── LoginPage.jsx
│   │   │       └── SignupPage.jsx
│   │   │
│   │   ├── medication/                  # Medication management
│   │   │   ├── components/
│   │   │   │   ├── schedule/
│   │   │   │   │   ├── MedicationCheckList.jsx      # Parent view
│   │   │   │   │   ├── MedicationCheckItem.jsx
│   │   │   │   │   └── CompletionButton.jsx
│   │   │   │   │
│   │   │   │   ├── monitoring/
│   │   │   │   │   ├── FamilyMonitorDashboard.jsx   # Child view
│   │   │   │   │   ├── RealTimeStatus.jsx
│   │   │   │   │   └── MissedDoseAlert.jsx
│   │   │   │   │
│   │   │   │   ├── ocr/
│   │   │   │   │   ├── PrescriptionScanner.jsx      # OCR UI
│   │   │   │   │   ├── ImageUploader.jsx
│   │   │   │   │   ├── ExtractionPreview.jsx
│   │   │   │   │   └── ManualCorrection.jsx
│   │   │   │   │
│   │   │   │   ├── search/
│   │   │   │   │   ├── PillSearchForm.jsx           # Pill identification
│   │   │   │   │   ├── PillSearchResult.jsx
│   │   │   │   │   ├── PillDetailModal.jsx
│   │   │   │   │   └── ColorShapePicker.jsx
│   │   │   │   │
│   │   │   │   ├── crud/
│   │   │   │   │   ├── MedicationList.jsx
│   │   │   │   │   ├── MedicationForm.jsx
│   │   │   │   │   ├── MedicationCard.jsx
│   │   │   │   │   └── InventoryTracker.jsx
│   │   │   │   │
│   │   │   │   └── report/
│   │   │   │       ├── AdherenceReportGenerator.jsx # Adherence report
│   │   │   │       ├── AdherenceChart.jsx
│   │   │   │       ├── WeeklyTrendChart.jsx
│   │   │   │       └── PDFDownloadButton.jsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useMedication.js
│   │   │   │   ├── useMedicationSync.js
│   │   │   │   ├── useOCR.js
│   │   │   │   ├── usePillSearch.js
│   │   │   │   └── useAdherenceReport.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── medicationService.js
│   │   │   │   ├── ocrExtractionService.js
│   │   │   │   ├── pillIdentificationService.js
│   │   │   │   └── adherenceCalculationService.js
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── MedicationListPage.jsx
│   │   │       ├── MedicationSchedulePage.jsx
│   │   │       ├── PrescriptionScanPage.jsx
│   │   │       ├── PillSearchPage.jsx
│   │   │       └── AdherenceReportPage.jsx
│   │   │
│   │   ├── family/                      # Family network
│   │   │   ├── components/
│   │   │   │   ├── FamilyGroupList.jsx
│   │   │   │   ├── FamilyMemberCard.jsx
│   │   │   │   ├── InviteMemberForm.jsx
│   │   │   │   └── RoleSelector.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFamily.js
│   │   │   │   └── useFamilySync.js
│   │   │   ├── services/
│   │   │   │   └── familyService.js
│   │   │   └── pages/
│   │   │       ├── FamilyGroupPage.jsx
│   │   │       └── FamilyInvitePage.jsx
│   │   │
│   │   ├── diet/                        # Diet & food interaction
│   │   │   ├── components/
│   │   │   │   ├── MealInputForm.jsx
│   │   │   │   ├── MealHistory.jsx
│   │   │   │   ├── InteractionWarning.jsx       # Warning UI
│   │   │   │   ├── WarningCard.jsx
│   │   │   │   └── AlternativeSuggestion.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDiet.js
│   │   │   │   └── useInteractionCheck.js
│   │   │   ├── services/
│   │   │   │   ├── dietService.js
│   │   │   │   └── interactionCheckService.js
│   │   │   └── pages/
│   │   │       ├── DietLogPage.jsx
│   │   │       └── InteractionWarningPage.jsx
│   │   │
│   │   ├── dashboard/                   # User dashboard
│   │   │   ├── components/
│   │   │   │   ├── DashboardOverview.jsx
│   │   │   │   ├── TodaysMedications.jsx
│   │   │   │   ├── UpcomingReminders.jsx
│   │   │   │   └── QuickActions.jsx
│   │   │   └── pages/
│   │   │       ├── ParentDashboard.jsx          # Senior user
│   │   │       └── ChildDashboard.jsx           # Caregiver
│   │   │
│   │   └── notifications/               # Notification system
│   │       ├── components/
│   │       │   ├── NotificationBell.jsx
│   │       │   ├── NotificationList.jsx
│   │       │   └── NotificationItem.jsx
│   │       ├── hooks/
│   │       │   └── useNotifications.js
│   │       └── services/
│   │           └── notificationService.js
│   │
│   ├── shared/                          # Shared components (ISP)
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── ErrorBoundary.jsx    # AOP: Error handling
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   │
│   │   │   └── feedback/
│   │   │       ├── Toast.jsx
│   │   │       ├── Alert.jsx
│   │   │       └── ConfirmDialog.jsx
│   │   │
│   │   └── hooks/
│   │       ├── useDebounce.js
│   │       ├── useLocalStorage.js
│   │       ├── useWebSocket.js
│   │       └── useIntersectionObserver.js
│   │
│   ├── routing/
│   │   ├── AppRouter.jsx
│   │   ├── PrivateRoute.jsx            # AOP: Route protection
│   │   ├── PublicRoute.jsx
│   │   └── routes.js
│   │
│   ├── aspects/                         # AOP: Cross-cutting concerns
│   │   ├── ErrorBoundary.jsx
│   │   ├── PerformanceMonitor.jsx
│   │   ├── AnalyticsTracker.jsx
│   │   └── AccessibilityWrapper.jsx
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── styles/
│       ├── main.scss
│       ├── variables.scss
│       ├── mixins.scss
│       ├── reset.scss
│       └── components/
│           ├── _button.scss
│           ├── _form.scss
│           └── _card.scss
│
├── tests/                              # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── package.json
├── vite.config.js
├── .eslintrc.json
├── .prettierrc
└── jsconfig.json
```

---

## ⚙️ Backend Structure (Spring Boot)

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/silvercare/
│   │   │   │
│   │   │   ├── SilverCareApplication.java    # Main entry point
│   │   │   │
│   │   │   ├── domain/                       # Domain layer (SRP, DIP)
│   │   │   │   ├── model/                    # Domain entities
│   │   │   │   │   ├── user/
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   ├── Role.java
│   │   │   │   │   │   └── UserRole.java
│   │   │   │   │   │
│   │   │   │   │   ├── family/
│   │   │   │   │   │   ├── FamilyGroup.java
│   │   │   │   │   │   ├── FamilyMember.java
│   │   │   │   │   │   └── MemberRole.java
│   │   │   │   │   │
│   │   │   │   │   ├── medication/
│   │   │   │   │   │   ├── Medication.java
│   │   │   │   │   │   ├── MedicationSchedule.java
│   │   │   │   │   │   ├── MedicationLog.java
│   │   │   │   │   │   └── Inventory.java
│   │   │   │   │   │
│   │   │   │   │   ├── diet/
│   │   │   │   │   │   ├── DietLog.java
│   │   │   │   │   │   ├── DietWarning.java
│   │   │   │   │   │   └── MealType.java
│   │   │   │   │   │
│   │   │   │   │   ├── interaction/
│   │   │   │   │   │   ├── DrugFoodInteraction.java
│   │   │   │   │   │   └── InteractionSeverity.java
│   │   │   │   │   │
│   │   │   │   │   └── notification/
│   │   │   │   │       ├── Notification.java
│   │   │   │   │       └── NotificationType.java
│   │   │   │   │
│   │   │   │   └── repository/               # Repository interfaces (DIP)
│   │   │   │       ├── UserRepository.java
│   │   │   │       ├── FamilyGroupRepository.java
│   │   │   │       ├── MedicationRepository.java
│   │   │   │       ├── MedicationLogRepository.java
│   │   │   │       ├── DietLogRepository.java
│   │   │   │       ├── DrugFoodInteractionRepository.java
│   │   │   │       └── NotificationRepository.java
│   │   │   │
│   │   │   ├── application/                  # Application layer (Use Cases)
│   │   │   │   ├── service/                  # Service interfaces (ISP)
│   │   │   │   │   ├── user/
│   │   │   │   │   │   ├── IUserService.java
│   │   │   │   │   │   └── IAuthService.java
│   │   │   │   │   │
│   │   │   │   │   ├── medication/
│   │   │   │   │   │   ├── IMedicationService.java
│   │   │   │   │   │   ├── IMedicationScheduleService.java
│   │   │   │   │   │   ├── IAdherenceReportService.java
│   │   │   │   │   │   └── IOCRService.java
│   │   │   │   │   │
│   │   │   │   │   ├── family/
│   │   │   │   │   │   ├── IFamilyService.java
│   │   │   │   │   │   └── IFamilySyncService.java
│   │   │   │   │   │
│   │   │   │   │   ├── diet/
│   │   │   │   │   │   ├── IDietService.java
│   │   │   │   │   │   └── IInteractionCheckService.java
│   │   │   │   │   │
│   │   │   │   │   ├── pill/
│   │   │   │   │   │   └── IPillIdentificationService.java
│   │   │   │   │   │
│   │   │   │   │   └── notification/
│   │   │   │   │       └── INotificationService.java
│   │   │   │   │
│   │   │   │   ├── usecase/                  # Use case implementations
│   │   │   │   │   ├── medication/
│   │   │   │   │   │   ├── RegisterMedicationUseCase.java
│   │   │   │   │   │   ├── CompleteMedicationUseCase.java
│   │   │   │   │   │   ├── GenerateAdherenceReportUseCase.java
│   │   │   │   │   │   └── ScanPrescriptionUseCase.java
│   │   │   │   │   │
│   │   │   │   │   ├── diet/
│   │   │   │   │   │   ├── LogMealUseCase.java
│   │   │   │   │   │   └── CheckInteractionUseCase.java
│   │   │   │   │   │
│   │   │   │   │   └── family/
│   │   │   │   │       ├── CreateFamilyGroupUseCase.java
│   │   │   │   │       └── InviteMemberUseCase.java
│   │   │   │   │
│   │   │   │   └── dto/                      # Data Transfer Objects (SRP)
│   │   │   │       ├── request/
│   │   │   │       │   ├── medication/
│   │   │   │       │   │   ├── RegisterMedicationRequest.java
│   │   │   │       │   │   ├── CompleteMedicationRequest.java
│   │   │   │       │   │   └── PrescriptionScanRequest.java
│   │   │   │       │   │
│   │   │   │       │   ├── diet/
│   │   │   │       │   │   ├── LogMealRequest.java
│   │   │   │       │   │   └── CheckInteractionRequest.java
│   │   │   │       │   │
│   │   │   │       │   └── family/
│   │   │   │       │       └── CreateFamilyGroupRequest.java
│   │   │   │       │
│   │   │   │       └── response/
│   │   │   │           ├── medication/
│   │   │   │           │   ├── MedicationResponse.java
│   │   │   │           │   ├── AdherenceReportResponse.java
│   │   │   │           │   └── OCRExtractionResponse.java
│   │   │   │           │
│   │   │   │           ├── diet/
│   │   │   │           │   └── InteractionWarningResponse.java
│   │   │   │           │
│   │   │   │           └── common/
│   │   │   │               ├── ApiResponse.java
│   │   │   │               └── ErrorResponse.java
│   │   │   │
│   │   │   ├── infrastructure/               # Infrastructure layer
│   │   │   │   ├── service/                  # Service implementations (SRP)
│   │   │   │   │   ├── user/
│   │   │   │   │   │   ├── UserServiceImpl.java
│   │   │   │   │   │   └── AuthServiceImpl.java
│   │   │   │   │   │
│   │   │   │   │   ├── medication/
│   │   │   │   │   │   ├── MedicationServiceImpl.java
│   │   │   │   │   │   ├── MedicationScheduleServiceImpl.java
│   │   │   │   │   │   ├── AdherenceReportServiceImpl.java
│   │   │   │   │   │   └── OCRServiceImpl.java
│   │   │   │   │   │
│   │   │   │   │   ├── family/
│   │   │   │   │   │   ├── FamilyServiceImpl.java
│   │   │   │   │   │   └── FamilySyncServiceImpl.java
│   │   │   │   │   │
│   │   │   │   │   ├── diet/
│   │   │   │   │   │   ├── DietServiceImpl.java
│   │   │   │   │   │   └── InteractionCheckServiceImpl.java
│   │   │   │   │   │
│   │   │   │   │   ├── pill/
│   │   │   │   │   │   └── PillIdentificationServiceImpl.java
│   │   │   │   │   │
│   │   │   │   │   ├── notification/
│   │   │   │   │   │   ├── NotificationServiceImpl.java
│   │   │   │   │   │   └── KakaoAlimtalkService.java
│   │   │   │   │   │
│   │   │   │   │   └── external/             # External API integrations
│   │   │   │   │       ├── ocr/
│   │   │   │   │       │   ├── GoogleVisionClient.java
│   │   │   │   │       │   └── TesseractClient.java
│   │   │   │   │       │
│   │   │   │   │       ├── drug/
│   │   │   │   │       │   └── MFDSApiClient.java    # 식약처 API
│   │   │   │   │       │
│   │   │   │   │       └── kakao/
│   │   │   │   │           └── KakaoApiClient.java
│   │   │   │   │
│   │   │   │   ├── persistence/              # Database implementations
│   │   │   │   │   └── jpa/
│   │   │   │   │       └── [Repository implementations]
│   │   │   │   │
│   │   │   │   ├── messaging/                # Kafka event handling
│   │   │   │   │   ├── producer/
│   │   │   │   │   │   ├── MedicationEventProducer.java
│   │   │   │   │   │   ├── DietWarningProducer.java
│   │   │   │   │   │   └── NotificationProducer.java
│   │   │   │   │   │
│   │   │   │   │   ├── consumer/
│   │   │   │   │   │   ├── MedicationEventConsumer.java
│   │   │   │   │   │   └── NotificationConsumer.java
│   │   │   │   │   │
│   │   │   │   │   └── event/
│   │   │   │   │       ├── MedicationCompletedEvent.java
│   │   │   │   │       ├── MedicationMissedEvent.java
│   │   │   │   │       └── DrugFoodWarningEvent.java
│   │   │   │   │
│   │   │   │   ├── pdf/                      # PDF generation
│   │   │   │   │   ├── IPDFGenerator.java
│   │   │   │   │   └── ITextPDFGenerator.java
│   │   │   │   │
│   │   │   │   ├── cache/                    # Redis caching
│   │   │   │   │   ├── CacheService.java
│   │   │   │   │   └── CacheKeyGenerator.java
│   │   │   │   │
│   │   │   │   └── scheduler/                # Scheduled tasks
│   │   │   │       ├── MedicationReminderScheduler.java
│   │   │   │       └── InventoryCheckScheduler.java
│   │   │   │
│   │   │   ├── presentation/                 # Presentation layer (Controllers)
│   │   │   │   ├── controller/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   └── AuthController.java
│   │   │   │   │   │
│   │   │   │   │   ├── medication/
│   │   │   │   │   │   ├── MedicationController.java
│   │   │   │   │   │   ├── MedicationScheduleController.java
│   │   │   │   │   │   ├── OCRController.java
│   │   │   │   │   │   └── AdherenceReportController.java
│   │   │   │   │   │
│   │   │   │   │   ├── family/
│   │   │   │   │   │   └── FamilyController.java
│   │   │   │   │   │
│   │   │   │   │   ├── diet/
│   │   │   │   │   │   ├── DietController.java
│   │   │   │   │   │   └── InteractionController.java
│   │   │   │   │   │
│   │   │   │   │   ├── pill/
│   │   │   │   │   │   └── PillSearchController.java
│   │   │   │   │   │
│   │   │   │   │   └── notification/
│   │   │   │   │       └── NotificationController.java
│   │   │   │   │
│   │   │   │   └── websocket/                # WebSocket endpoints
│   │   │   │       ├── FamilySyncWebSocket.java
│   │   │   │       └── NotificationWebSocket.java
│   │   │   │
│   │   │   ├── config/                       # Configuration classes
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebConfig.java
│   │   │   │   ├── JpaConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── KafkaConfig.java
│   │   │   │   ├── HocuspocusConfig.java
│   │   │   │   └── SwaggerConfig.java
│   │   │   │
│   │   │   ├── aspect/                       # AOP: Cross-cutting concerns
│   │   │   │   ├── LoggingAspect.java        # Logging aspect
│   │   │   │   ├── PerformanceAspect.java    # Execution time tracking
│   │   │   │   ├── TransactionAspect.java    # Transaction management
│   │   │   │   ├── SecurityAspect.java       # Security checks
│   │   │   │   └── ExceptionAspect.java      # Exception handling
│   │   │   │
│   │   │   ├── security/                     # Security components
│   │   │   │   ├── jwt/
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── JwtAuthenticationEntryPoint.java
│   │   │   │   │
│   │   │   │   └── userdetails/
│   │   │   │       └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── exception/                    # Exception handling (AOP)
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── custom/
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── UnauthorizedException.java
│   │   │   │   │   ├── ValidationException.java
│   │   │   │   │   ├── OCRProcessingException.java
│   │   │   │   │   └── ExternalApiException.java
│   │   │   │   │
│   │   │   │   └── ErrorCode.java
│   │   │   │
│   │   │   ├── validation/                   # Validation rules (SRP)
│   │   │   │   ├── validator/
│   │   │   │   │   ├── MedicationValidator.java
│   │   │   │   │   ├── DietValidator.java
│   │   │   │   │   └── FamilyGroupValidator.java
│   │   │   │   │
│   │   │   │   └── annotation/
│   │   │   │       ├── ValidMedication.java
│   │   │   │       └── ValidPhoneNumber.java
│   │   │   │
│   │   │   └── util/                         # Utility classes
│   │   │       ├── DateTimeUtil.java
│   │   │       ├── StringUtil.java
│   │   │       ├── EncryptionUtil.java
│   │   │       └── FileUtil.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       │
│   │       ├── db/
│   │       │   └── migration/                # Flyway migrations
│   │       │       ├── V1__create_user_tables.sql
│   │       │       ├── V2__create_medication_tables.sql
│   │       │       ├── V3__create_family_tables.sql
│   │       │       ├── V4__create_diet_tables.sql
│   │       │       ├── V5__create_interaction_tables.sql
│   │       │       └── V6__insert_initial_data.sql
│   │       │
│   │       ├── data/
│   │       │   └── drug-food-interactions.json  # Initial interaction data
│   │       │
│   │       ├── templates/                    # PDF templates
│   │       │   └── adherence-report-template.html
│   │       │
│   │       └── static/
│   │           └── fonts/
│   │               └── NanumGothic.ttf
│   │
│   └── test/
│       └── java/com/silvercare/
│           ├── unit/                         # Unit tests
│           │   ├── service/
│           │   ├── usecase/
│           │   └── util/
│           │
│           ├── integration/                  # Integration tests
│           │   ├── api/
│           │   └── repository/
│           │
│           └── e2e/                          # End-to-end tests
│
├── pom.xml
├── .gitignore
└── README.md
```

---

## 🎯 SOLID Principles Implementation

### 1. **Single Responsibility Principle (SRP)**

Each class has ONE reason to change:

```java
// ❌ BAD: Multiple responsibilities
public class MedicationService {
    public void saveMedication() { }
    public void sendNotification() { }
    public void generatePDF() { }
    public void logActivity() { }
}

// ✅ GOOD: Single responsibility
public class MedicationService {
    public void saveMedication() { }
}

public class NotificationService {
    public void sendNotification() { }
}

public class PDFGeneratorService {
    public void generatePDF() { }
}

public class LoggingAspect {
    public void logActivity() { }  // AOP
}
```

### 2. **Open/Closed Principle (OCP)**

Open for extension, closed for modification:

```javascript
// Frontend: OCR Service Factory
class OCRServiceFactory {
    static createOCRService(type) {
        switch(type) {
            case 'google': return new GoogleVisionOCR();
            case 'tesseract': return new TesseractOCR();
            default: throw new Error('Unknown OCR service');
        }
    }
}

// Add new OCR service without modifying existing code
class AzureOCR extends IOCRService {
    async extract(image) { /* implementation */ }
}
```

```java
// Backend: Notification Strategy Pattern
public interface INotificationStrategy {
    void send(Notification notification);
}

public class EmailNotificationStrategy implements INotificationStrategy { }
public class KakaoNotificationStrategy implements INotificationStrategy { }
public class SMSNotificationStrategy implements INotificationStrategy { }

// Add new notification type without modifying existing code
```

### 3. **Liskov Substitution Principle (LSP)**

Subtypes must be substitutable for their base types:

```javascript
// Frontend: Storage Service
class IStorageService {
    get(key) { throw new Error('Must implement'); }
    set(key, value) { throw new Error('Must implement'); }
}

class LocalStorageService extends IStorageService {
    get(key) { return localStorage.getItem(key); }
    set(key, value) { localStorage.setItem(key, value); }
}

class SessionStorageService extends IStorageService {
    get(key) { return sessionStorage.getItem(key); }
    set(key, value) { sessionStorage.setItem(key, value); }
}

// Both can be used interchangeably
const storage = useLocalStorage
    ? new LocalStorageService()
    : new SessionStorageService();
```

### 4. **Interface Segregation Principle (ISP)**

Clients shouldn't depend on interfaces they don't use:

```java
// Backend: Split large interfaces

// ❌ BAD: Fat interface
public interface IMedicationService {
    void register();
    void update();
    void delete();
    void generateReport();  // Not all clients need this
    void scanPrescription(); // Not all clients need this
}

// ✅ GOOD: Segregated interfaces
public interface IMedicationCRUDService {
    void register();
    void update();
    void delete();
}

public interface IMedicationReportService {
    AdherenceReport generateReport();
}

public interface IMedicationScanService {
    MedicationInfo scanPrescription(Image image);
}
```

### 5. **Dependency Inversion Principle (DIP)**

Depend on abstractions, not concretions:

```java
// Backend: Dependency Injection

// ❌ BAD: Direct dependency on concrete class
public class MedicationController {
    private MedicationServiceImpl service = new MedicationServiceImpl();
}

// ✅ GOOD: Dependency on interface
@RestController
public class MedicationController {

    @Autowired
    private IMedicationService medicationService;  // Abstract interface

    @Autowired
    private INotificationService notificationService;  // Abstract interface
}
```

```javascript
// Frontend: Dependency Injection via Context

// ✅ GOOD: Inject dependencies
const MedicationList = ({ medicationService, notificationService }) => {
    // Use injected services
    const medications = medicationService.getAll();
};

// Provider injects concrete implementations
<ServiceProvider
    medicationService={new MedicationApiClient()}
    notificationService={new NotificationService()}
>
    <MedicationList />
</ServiceProvider>
```

---

## 🔄 AOP Implementation

### Frontend AOP (React)

```javascript
// 1. Logging Interceptor
export const loggingInterceptor = (config) => {
    console.log(`[${new Date().toISOString()}] ${config.method} ${config.url}`);
    return config;
};

// 2. Error Handling Interceptor
export const errorInterceptor = (error) => {
    const message = error.response?.data?.message || 'Unknown error';
    toast.error(message);

    if (error.response?.status === 401) {
        // Redirect to login
        window.location.href = '/login';
    }

    return Promise.reject(error);
};

// 3. Performance Monitor HOC
export const withPerformanceMonitor = (Component) => {
    return (props) => {
        useEffect(() => {
            const start = performance.now();
            return () => {
                const end = performance.now();
                console.log(`${Component.name} rendered in ${end - start}ms`);
            };
        }, []);

        return <Component {...props} />;
    };
};
```

### Backend AOP (Spring Boot)

```java
// 1. Logging Aspect
@Aspect
@Component
public class LoggingAspect {

    @Before("execution(* com.silvercare..controller.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        log.info("Method: {}, Args: {}",
            joinPoint.getSignature().getName(),
            Arrays.toString(joinPoint.getArgs()));
    }

    @AfterReturning(
        pointcut = "execution(* com.silvercare..controller.*.*(..))",
        returning = "result"
    )
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        log.info("Method: {} returned: {}",
            joinPoint.getSignature().getName(), result);
    }
}

// 2. Performance Aspect
@Aspect
@Component
public class PerformanceAspect {

    @Around("execution(* com.silvercare..service.*.*(..))")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed();

        long executionTime = System.currentTimeMillis() - start;
        log.info("{} executed in {}ms",
            joinPoint.getSignature().getName(), executionTime);

        return result;
    }
}

// 3. Transaction Aspect
@Aspect
@Component
public class TransactionAspect {

    @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
    public Object handleTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
        log.info("Transaction started: {}", joinPoint.getSignature().getName());

        try {
            Object result = joinPoint.proceed();
            log.info("Transaction committed: {}", joinPoint.getSignature().getName());
            return result;
        } catch (Exception e) {
            log.error("Transaction rolled back: {}", joinPoint.getSignature().getName());
            throw e;
        }
    }
}

// 4. Security Aspect
@Aspect
@Component
public class SecurityAspect {

    @Before("@annotation(com.silvercare.security.annotation.RequireAuth)")
    public void checkAuthentication(JoinPoint joinPoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }

        log.info("User {} accessing {}",
            auth.getName(),
            joinPoint.getSignature().getName());
    }
}
```

---

## 📦 Key Design Patterns Used

### 1. **Factory Pattern** (OCP)
- `OCRServiceFactory`: Creates appropriate OCR service
- `NotificationStrategyFactory`: Creates notification strategy

### 2. **Strategy Pattern** (OCP)
- `INotificationStrategy`: Different notification methods
- `IOCRService`: Different OCR providers

### 3. **Repository Pattern** (DIP)
- `IUserRepository`, `IMedicationRepository`: Abstract data access

### 4. **Builder Pattern** (SRP)
- `AdherenceReport.builder()`: Builds complex objects

### 5. **Decorator Pattern** (OCP)
- React HOCs: `withAuth`, `withPerformanceMonitor`

### 6. **Observer Pattern**
- Kafka events: Medication completed/missed events
- Hocuspocus: Real-time family sync

### 7. **Singleton Pattern**
- Service configurations
- API clients

---

## 🚀 Benefits of This Structure

### 1. **Maintainability**
- Clear separation of concerns
- Easy to locate and fix bugs
- Each module has single responsibility

### 2. **Testability**
- Easy to mock dependencies
- Unit tests for each layer
- Integration tests for workflows

### 3. **Scalability**
- Add new features without modifying existing code
- Horizontal scaling possible
- Microservices-ready architecture

### 4. **Reusability**
- Shared components across features
- Common utilities
- Abstract interfaces

### 5. **Team Collaboration**
- Clear module boundaries
- Parallel development possible
- Minimal merge conflicts

---

## 📝 File Naming Conventions

### Frontend (JavaScript/JSX)
- **Components**: PascalCase + `.jsx`
  - `MedicationList.jsx`, `LoginForm.jsx`
- **Hooks**: camelCase + `use` prefix + `.js`
  - `useMedication.js`, `useAuth.js`
- **Services**: camelCase + `Service` suffix + `.js`
  - `medicationService.js`, `ocrService.js`
- **Utils**: camelCase + `Utils` suffix + `.js`
  - `dateUtils.js`, `validationUtils.js`
- **Constants**: UPPER_SNAKE_CASE
  - `API_ENDPOINTS`, `ERROR_CODES`

### Backend (Java)
- **Entities**: PascalCase + singular noun
  - `User.java`, `Medication.java`
- **Repositories**: PascalCase + `Repository` suffix
  - `UserRepository.java`, `MedicationRepository.java`
- **Services**: PascalCase + `Service` or `ServiceImpl` suffix
  - `IMedicationService.java`, `MedicationServiceImpl.java`
- **Controllers**: PascalCase + `Controller` suffix
  - `MedicationController.java`
- **DTOs**: PascalCase + `Request`/`Response` suffix
  - `RegisterMedicationRequest.java`, `MedicationResponse.java`
- **Aspects**: PascalCase + `Aspect` suffix
  - `LoggingAspect.java`, `PerformanceAspect.java`

---

## 🔑 Key Takeaways

1. **Layer Separation**: Domain → Application → Infrastructure → Presentation
2. **Dependency Direction**: Always depend on abstractions (interfaces)
3. **AOP for Cross-cutting Concerns**: Logging, security, transactions
4. **Feature-based Modules**: Medication, Family, Diet, etc.
5. **Shared Components**: Reusable UI, utilities, hooks
6. **Clear Boundaries**: Easy to test, maintain, and scale

---

**Version**: 1.0
**Last Updated**: 2025-11-05
**Author**: SilverCare Development Team
