# CORS Setup Guide

## Overview
This project uses a dual-layer CORS strategy:
1.  **Development**: Vite Proxy + Spring Boot CORS (Direct access)
2.  **Production**: Nginx Reverse Proxy + Spring Boot CORS (Layered security)

## 1. Development Environment (`npm run dev`)
In development, the Vite dev server runs on `localhost:5173`.
- API requests are proxied via `vite.config.js` to `localhost:8082` (or 8081 for Auth).
- **Backend CORS**: `CorsConfig.java` explicitly allows `http://localhost:5173`.

## 2. Production Environment (Docker / Nginx)
In production, Nginx serves the React app and proxies API requests.

### Nginx Configuration (`nginx.conf`)
We use a **dynamic `map` directive** to handle CORS safely across multiple domains (Localhost, Dev, Prod) without hardcoding or using wildcards.

```nginx
# Dynamic CORS Origin Configuration
map $http_origin $cors_origin {
    default "";
    "http://localhost:5173" "$http_origin";          # Dev (Vite)
    "https://amapill.com" "$http_origin";            # Production
    "https://www.amapill.com" "$http_origin";        # Production (www)
    "https://dev.amapill.com" "$http_origin";        # Staging
}

server {
    # ...
    location /api/ {
        # ...
        add_header Access-Control-Allow-Origin "$cors_origin" always;
        add_header Access-Control-Allow-Credentials "true" always;
        # ...
    }
}
```

### Adding New Domains
To add a new domain (e.g., a new staging server), simply add it to the `map` block in `nginx.conf`:

```nginx
map $http_origin $cors_origin {
    # ... existing domains
    "https://new-staging.amapill.com" "$http_origin";
}
```

## 3. Backend Configuration (Spring Boot)
For the Nginx CORS settings to work effectively, the backend must also be configured to allow these origins.

### `CorsConfig.java`
Ensure all production domains are added to `allowedOriginPatterns`:

```java
config.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:5173",
    "https://amapill.com",
    "https://www.amapill.com",
    "https://dev.amapill.com"
));
```

### `SecurityConfig.java`
Ensure CORS is enabled in the security filter chain:

```java
http
    .cors(cors -> cors.configurationSource(corsConfigurationSource))
    // ... other configs
```
