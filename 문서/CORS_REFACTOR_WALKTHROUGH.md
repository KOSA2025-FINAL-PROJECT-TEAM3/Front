# Walkthrough - CORS Hardening & Refactor

## Goal
Address critical CORS vulnerabilities and configuration issues across both Backend (Spring Boot) and Frontend (Nginx) to ensure secure and functional cross-origin requests in production environments.

## Changes

### Backend (Spring Boot)

#### 1. `CorsConfig.java`
- **Change**: Added production domains (`amapill.com`, `dev.amapill.com`) to the allowed origin patterns.
- **Change**: Exposed `CorsConfigurationSource` as a Bean for use in `SecurityConfig`.

#### 2. `SecurityConfig.java`
- **Change**: Explicitly enabled CORS in the security filter chain using `.cors(cors -> cors.configurationSource(corsConfigurationSource))`.
- **Reason**: Without this, Spring Security blocks preflight OPTIONS requests before they reach the application logic.

### Frontend (Nginx)

#### 3. `nginx.conf`
- **Change**: Replaced hardcoded `Access-Control-Allow-Origin` header with a dynamic `map` directive.
- **Mechanism**:
    ```nginx
    map $http_origin $cors_origin {
        default "";
        "http://localhost:5173" "$http_origin";
        "https://amapill.com" "$http_origin";
        # ... other domains
    }
    ```
- **Benefit**: securely supports multiple environments (Dev, Staging, Prod) without manual configuration changes or dangerous wildcards.

### Documentation

#### 4. `CORS_SETUP.md`
- **Change**: Updated to reflect the new Nginx configuration and backend requirements.
- **Change**: Added a guide on how to add new domains in the future.

## Verification Results

### Manual Verification
- **Backend Code**: Confirmed `SecurityConfig` injects `CorsConfigurationSource` and enables `.cors()`.
- **Backend Code**: Confirmed `CorsConfig` includes production domains.
- **Frontend Code**: Confirmed `nginx.conf` uses `$cors_origin` variable derived from the `map` block.
