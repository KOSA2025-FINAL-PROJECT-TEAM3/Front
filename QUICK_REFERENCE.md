# AMApill Frontend - Quick Reference Guide

## Configuration At a Glance

### Development Mode (Port 5173)

**Start Command**:
```bash
npm run dev
```

**URL**: http://localhost:5173

**How it works**:
- Vite dev server on port 5173
- Vite proxy forwards `/api` → `localhost:8090`
- Vite proxy forwards `/ws` → `localhost:8080`
- Hot Module Replacement (HMR) enabled

**Environment** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:8090
VITE_WS_BASE_URL=ws://localhost:8080
VITE_DEBUG=true
```

---

### Production Mode (Port 80/443)

**Build Command**:
```bash
npm run build
```

**Deploy to Nginx**:
```bash
sudo cp -r dist/* /usr/share/nginx/html/
sudo cp nginx.conf /etc/nginx/conf.d/amapill.conf
sudo systemctl reload nginx
```

**URL**: http://amapill.com (or http://localhost if local)

**How it works**:
- Nginx serves static files from `/usr/share/nginx/html`
- Nginx reverse proxy forwards `/api` → `backend:8090`
- Nginx reverse proxy forwards `/ws` → `backend:8080`
- Auto-detects URLs from `window.location`

**Environment** (`.env.production`):
```env
# Leave empty for auto-detection
VITE_API_BASE_URL=
VITE_WS_BASE_URL=
VITE_FRONTEND_URL=https://amapill.example.com
```

---

### Docker Deployment

**Command**:
```bash
docker compose -f docker-compose.nginx.yml up -d
```

**URL**: http://localhost

**Stop**:
```bash
docker compose -f docker-compose.nginx.yml down
```

---

## File Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Development environment variables |
| `.env.template` | Template with dev/prod examples |
| `.env.production` | Production environment variables |
| `.env.production.template` | Production template |
| `vite.config.js` | Vite configuration with proxy |
| `nginx.conf` | Nginx reverse proxy config |
| `docker-compose.nginx.yml` | Docker deployment |

### Code Files

| File | Purpose |
|------|---------|
| `src/core/config/environment.config.js` | Dynamic environment detection |
| `src/core/config/api.config.js` | API configuration |
| `src/core/services/api/ApiClient.js` | Base API client |
| `src/core/services/api/*ApiClient.js` | Service-specific clients |

### Documentation

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete deployment guide |
| `NGINX_DEPLOYMENT_SUMMARY.md` | Technical summary |
| `QUICK_REFERENCE.md` | This file |

---

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run linter
npm run lint

# Build and preview
npm run build
npm run preview
```

### Deployment

```bash
# Production build
npm run build -- --mode production

# Copy to Nginx
sudo cp -r dist/* /usr/share/nginx/html/

# Reload Nginx
sudo systemctl reload nginx

# Docker deployment
docker compose -f docker-compose.nginx.yml up -d

# View Docker logs
docker compose -f docker-compose.nginx.yml logs -f
```

---

## Environment Variables

### Required for Development

```env
VITE_API_BASE_URL=http://localhost:8090
VITE_WS_BASE_URL=ws://localhost:8080
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
```

### Required for Production

```env
# Auto-detection (recommended)
VITE_API_BASE_URL=
VITE_WS_BASE_URL=
VITE_FRONTEND_URL=https://your-domain.com
VITE_KAKAO_CLIENT_ID=your_production_kakao_id
VITE_KAKAO_REDIRECT_URI=https://your-domain.com/auth/kakao/callback

# OR explicit URLs
VITE_API_BASE_URL=https://api.your-domain.com
VITE_WS_BASE_URL=wss://api.your-domain.com/ws
```

---

## Troubleshooting Quick Fixes

### Dev server won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API calls fail (404)
Check backend is running:
```bash
curl http://localhost:8090/api/health
```

### Build fails
Clear Vite cache:
```bash
rm -rf node_modules/.vite
npm run build
```

### Nginx 404 on refresh
Ensure `nginx.conf` has:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### WebSocket connection fails
Check Nginx WebSocket proxy:
```nginx
location /ws {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

---

## Port Reference

| Service | Dev Port | Prod Port | Notes |
|---------|----------|-----------|-------|
| Frontend (Vite) | 5173 | - | Dev only |
| Frontend (Nginx) | - | 80/443 | Prod only |
| API Gateway | 8090 | 8090 | Backend |
| WebSocket | 8080 | 8080 | Backend |
| Auth Service | 8081 | 8081 | Microservice |

---

## Nginx Configuration Highlights

### SPA Routing
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### API Proxy
```nginx
location /api/ {
    proxy_pass http://localhost:8090;
    proxy_set_header Host $host;
}
```

### WebSocket Proxy
```nginx
location /ws {
    proxy_pass http://localhost:8080;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Cache Busting
```nginx
location ~* \.(js|css|png|jpg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Health Checks

### Frontend (Development)
```bash
curl http://localhost:5173
```

### Frontend (Production)
```bash
curl http://localhost/health
```

### Backend (API Gateway)
```bash
curl http://localhost:8090/api/health
```

### Nginx Status
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## Quick Decision Tree

**Need to start developing?**
→ `npm run dev`

**Need to test production build locally?**
→ `npm run build && npm run preview`

**Need to deploy to production?**
→ `npm run build -- --mode production`
→ Copy `dist/` to Nginx

**Need to deploy with Docker?**
→ `docker compose -f docker-compose.nginx.yml up -d`

**API calls not working?**
→ Dev: Check Vite proxy in `vite.config.js`
→ Prod: Check Nginx proxy in `nginx.conf`

**WebSocket not connecting?**
→ Dev: Check `VITE_WS_BASE_URL` in `.env`
→ Prod: Check Nginx `/ws` location block

---

**Last Updated**: 2025-11-17
**Version**: 1.0.0
