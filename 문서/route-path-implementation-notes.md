# Route Path Implementation Notes

This document captures the verified facts and the recommended implementation
decisions for the route path cleanup. It is intended to help implement the
changes consistently and safely.

## Scope

- Frontend routing and navigation cleanup only.
- No backend changes.

## Verified facts

1) Family chat routing uses `familyGroupId` in backend REST and WebSocket.
   - REST controller uses `/rooms/{familyGroupId}` and explicitly states that
     "roomId now acts as familyGroupId".
   - WebSocket mappings use `/family/{familyGroupId}`.
   - Files:
     - `spring-boot/src/main/java/com/amapill/backend/domain/chat/api/FamilyChatRestController.java`
     - `spring-boot/src/main/java/com/amapill/backend/domain/chat/api/FamilyChatSocketController.java`

2) Prescription list is implemented in the medication management page.
   - The list and navigation to detail are in:
     - `Front/src/features/medication/pages/MedicationManagement.jsx`

3) Prescription edit does not have a dedicated page.
   - Editing and saving happen inside the detail page:
     - `Front/src/features/medication/pages/PrescriptionDetailPage.jsx`

4) The historical route snapshot was recorded at commit
   `ec2628dedb6b78b608a31c21b6d2d1ebaddc8070`.
   - Snapshot file:
     - `Front/docs/refactoring-before-route-paths.md`

## UX implications

- Chat routes should preserve the group id and redirect to the group-based
  chat route so the correct room opens.
- `/prescriptions` should land on the current medication management list.
- `/prescriptions/:id/edit` should land on the detail page which already
  supports edit and save.
- `/select-role` should redirect to `/role-selection` and internal navigation
  should use the configured route constant.

## Implementation checklist

- Replace `ROUTE_PATHS.medicationManagement` usage with `ROUTE_PATHS.medication`.
- Replace hardcoded `/select-role` navigation with `ROUTE_PATHS.roleSelection`.
- Add legacy redirects:
  - `/select-role` -> `/role-selection`
  - `/prescriptions` -> `/medication`
  - `/prescriptions/:id/edit` -> `/prescriptions/:id`
  - `/chat/:roomId` and `/chat/family/:roomId` -> `/chat/family/group/:familyGroupId`

## Validation checklist

- Manually navigate to:
  - `/select-role` (redirect to `/role-selection`)
  - `/prescriptions` (redirect to `/medication`)
  - `/prescriptions/:id/edit` (redirect to `/prescriptions/:id`)
  - `/chat/:id` and `/chat/family/:id` (redirect to `/chat/family/group/:id`)
  - `/chat/family/group/:id` (loads chat page with correct group)

