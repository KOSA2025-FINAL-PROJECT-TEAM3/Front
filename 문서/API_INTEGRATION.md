# API Integration Guide

> **Context**: Frontend API integration patterns and standards.
> **Last Updated**: 2025-11-27

## Disease API Integration

### Endpoints
- `POST /api/disease/{id}/restore`: Restore a deleted disease from trash.

### Usage Example (React)
```javascript
// diseaseApiClient.js
async restore(diseaseId) {
  return client.post(`/${diseaseId}/restore`)
}

// useDiseases.js
const restoreDisease = async (diseaseId) => {
  await diseaseApiClient.restore(diseaseId);
  await refreshTrash(); // Refresh trash list
  await refreshDiseases(); // Refresh active list
}
```
