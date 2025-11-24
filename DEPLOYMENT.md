# Frontend Deployment Guide

This guide explains how to deploy the AMApill React frontend in both development and production environments.

## Table of Contents

- [Development Mode](#development-mode)
- [Production Build](#production-build)
- [Nginx Deployment](#nginx-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Development Mode

### Prerequisites
- Node.js 18+ installed
- Backend services running (API Gateway on port 8090)

### Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.template .env

# Edit .env with your configuration
# For development, the default values should work

# Start development server
npm run dev
```

The frontend will be available at **http://localhost:5173**

### Development Configuration

In development mode:
- **Vite dev server** runs on port 5173
- **API proxy** forwards `/api/*` requests to `http://localhost:8090`
- **WebSocket proxy** forwards `/ws` to `ws://localhost:8080`
- **Hot Module Replacement (HMR)** enabled for rapid development
- **Source maps** enabled for debugging

### Development Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8090
VITE_WS_BASE_URL=ws://localhost:8080
VITE_FRONTEND_URL=http://localhost:5173
VITE_DEBUG=true
```

---

## Production Build

### Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/ directory
```

The build process:
1. Compiles React components
2. Bundles JavaScript with code splitting
3. Minifies CSS and JavaScript
4. Optimizes assets (images, fonts)
5. Generates `dist/` directory ready for deployment

### Build Output

```
dist/
├── index.html           # Entry point
├── assets/
│   ├── index-[hash].js  # Main bundle
│   ├── vendor-[hash].js # Vendor bundle (React, etc.)
│   ├── api-[hash].js    # API bundle (axios)
│   └── *.css            # Compiled stylesheets
└── favicon.ico
```

### Preview Production Build Locally

```bash
npm run preview
# Opens http://localhost:4173
```

---

## Nginx Deployment

### Method 1: Manual Deployment

#### Step 1: Build the Frontend

```bash
npm run build
```

#### Step 2: Copy Files to Nginx

```bash
# Copy built files to Nginx web root
sudo cp -r dist/* /usr/share/nginx/html/

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/conf.d/amapill.conf

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 3: Configure Environment for Production

Create `.env.production`:

```env
# Production configuration - leave empty for auto-detection
VITE_API_BASE_URL=
VITE_API_PORT=8090
VITE_WS_BASE_URL=
VITE_WS_PORT=8080
VITE_FRONTEND_URL=https://amapill.example.com
VITE_KAKAO_CLIENT_ID=your_production_kakao_client_id
VITE_KAKAO_REDIRECT_URI=https://amapill.example.com/auth/kakao/callback
VITE_DEBUG=false
VITE_USE_MOCK_API=false
```

Rebuild with production environment:

```bash
npm run build -- --mode production
```

### Method 2: Docker Deployment

#### Step 1: Build with Docker Compose

```bash
# Build and start Nginx container
docker compose -f docker-compose.nginx.yml up -d

# Check logs
docker compose -f docker-compose.nginx.yml logs -f nginx
```

#### Step 2: Access the Application

- Frontend: **http://localhost** (port 80)
- Health check: **http://localhost/health**

#### Step 3: Stop and Clean Up

```bash
# Stop containers
docker compose -f docker-compose.nginx.yml down

# Remove volumes
docker compose -f docker-compose.nginx.yml down -v
```

---

## Docker Deployment

### Dockerfile (Custom Build)

If you want to create a custom Docker image:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run

```bash
# Build Docker image
docker build -t amapill-frontend:latest .

# Run container
docker run -d \
  --name amapill-frontend \
  -p 80:80 \
  amapill-frontend:latest

# View logs
docker logs -f amapill-frontend
```

---

## Environment Configuration

### Environment Detection Logic

The frontend automatically detects the deployment environment:

#### Development Mode
- `import.meta.env.MODE === 'development'`
- Uses hardcoded `localhost` URLs
- Vite proxy enabled

#### Production Mode
- `import.meta.env.MODE === 'production'`
- Auto-detects URLs from `window.location`
- Nginx reverse proxy handles routing

### Configuration Priority

1. **Explicit environment variables** (`.env` file)
2. **Runtime detection** (`window.location` in production)
3. **Default fallbacks** (localhost in development)

### Example Configurations

#### Local Development
```env
VITE_API_BASE_URL=http://localhost:8090
VITE_WS_BASE_URL=ws://localhost:8080
```

#### Production (Nginx on same server)
```env
# Leave empty for auto-detection
VITE_API_BASE_URL=
VITE_WS_BASE_URL=
# Will resolve to window.location.origin
```

#### Production (Backend on different port)
```env
VITE_API_PORT=8090
VITE_WS_PORT=8080
# Will resolve to window.location.hostname:8090
```

#### Production (Backend on different server)
```env
VITE_API_BASE_URL=https://api.amapill.com
VITE_WS_BASE_URL=wss://api.amapill.com/ws
```

---

## Nginx Configuration Explained

### Key Features

1. **SPA Routing**: `try_files $uri $uri/ /index.html`
   - All routes handled by React Router
   - 404s redirect to index.html

2. **API Proxy**: `/api/*` → Backend
   - Forwards to `http://localhost:8090`
   - Adds proxy headers

3. **WebSocket Proxy**: `/ws` → WebSocket server
   - Forwards to `http://localhost:8080`
   - Handles upgrade headers

4. **Cache Busting**: Assets cached for 1 year
   - JavaScript, CSS, images
   - Hash-based filenames

5. **Security Headers**
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection

### Customizing Nginx

Edit `nginx.conf` to:
- Change backend server addresses
- Add HTTPS configuration
- Configure custom domains
- Add authentication

---

## Troubleshooting

### Issue: 404 on Page Refresh

**Cause**: Nginx not configured for SPA routing

**Solution**: Ensure `try_files $uri $uri/ /index.html;` is in Nginx config

### Issue: API Calls Fail (CORS Error)

**Cause**: Backend not accessible or CORS misconfigured

**Solution**:
1. Check backend is running: `curl http://localhost:8090/api/health`
2. Verify Nginx proxy configuration
3. Enable CORS in backend or Nginx

### Issue: WebSocket Connection Fails

**Cause**: WebSocket proxy not configured

**Solution**:
1. Check WebSocket server is running
2. Verify Nginx config has `proxy_set_header Upgrade $http_upgrade;`
3. Check firewall allows WebSocket connections

### Issue: Environment Variables Not Working

**Cause**: Build-time vs. runtime variables

**Solution**:
- Vite environment variables are **build-time** only
- Must rebuild after changing `.env`
- For runtime config, use `window.location` detection

### Issue: Assets Not Loading (404)

**Cause**: Incorrect base path

**Solution**:
- Check `vite.config.js` doesn't have incorrect `base` setting
- Verify Nginx `root` points to correct directory
- Ensure files exist in `dist/` after build

### Issue: Nginx 502 Bad Gateway

**Cause**: Backend service not reachable

**Solution**:
1. Check backend is running
2. Verify `upstream` block in Nginx config
3. Check firewall/network connectivity

---

## Production Checklist

Before deploying to production:

- [ ] Build with production environment variables
- [ ] Test production build locally (`npm run preview`)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up domain name and DNS
- [ ] Configure Nginx security headers
- [ ] Enable gzip compression
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Test API connectivity
- [ ] Test WebSocket connectivity
- [ ] Verify OAuth redirect URLs
- [ ] Set up automated deployments (CI/CD)
- [ ] Configure backup strategy

---

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Router Server Rendering](https://reactrouter.com/en/main/guides/ssr)

---

**Last Updated**: 2025-11-17
**Version**: 1.0.0
