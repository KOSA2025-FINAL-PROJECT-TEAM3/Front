// vite.config.js
import { defineConfig } from "file:///mnt/d/3rd3rd/Front/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/d/3rd3rd/Front/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///mnt/d/3rd3rd/Front/vite.config.js";
var rootDir = fileURLToPath(new URL(".", __vite_injected_original_import_meta_url));
var vite_config_default = defineConfig(({ command, mode }) => {
  const isProd = mode === "production";
  const isBuild = command === "build";
  return {
    plugins: [react()],
    // Use '/Front/' for production (GitHub Pages), '/' for development
    base: isProd ? "/Front/" : "/",
    resolve: {
      // 경로 alias 설정으로 import 경로를 간단하게
      alias: {
        "@": path.resolve(rootDir, "./src"),
        "@features": path.resolve(rootDir, "./src/features"),
        "@shared": path.resolve(rootDir, "./src/shared"),
        "@components": path.resolve(rootDir, "./src/shared/components"),
        "@devtools": path.resolve(rootDir, "./src/devtools"),
        "@hooks": path.resolve(rootDir, "./src/hooks"),
        "@pages": path.resolve(rootDir, "./src/pages"),
        "@styles": path.resolve(rootDir, "./src/styles"),
        "@utils": path.resolve(rootDir, "./src/core/utils"),
        "@config": path.resolve(rootDir, "./src/core/config"),
        "@core": path.resolve(rootDir, "./src/core")
      }
    },
    server: {
      host: true,
      // ✅ 외부 접근 허용 (0.0.0.0으로 바인딩)
      port: 5173,
      // 기본 포트
      open: false,
      // 자동 브라우저 열기 끄기
      cors: true,
      // CORS 허용
      proxy: {
        "/api": {
          target: "http://localhost:80",
          // Nginx → Gateway로 연결
          changeOrigin: true
        },
        "/ws": {
          target: "ws://localhost:80",
          // WebSocket via Nginx
          ws: true
        }
      }
    },
    // Production 빌드에서만 console/debugger 제거
    esbuild: isBuild && isProd ? { drop: ["console", "debugger"] } : {},
    build: {
      target: "ES2020",
      outDir: "dist",
      sourcemap: false,
      // Chunk splitting for better caching and parallel loading
      rollupOptions: {
        output: {
          manualChunks: {
            // React core - rarely changes
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            // MUI components - large bundle, separate for caching
            "vendor-mui": [
              "@mui/material",
              "@mui/icons-material",
              "@emotion/react",
              "@emotion/styled"
            ],
            // Data fetching and state management
            "vendor-data": ["@tanstack/react-query", "zustand", "axios"],
            // Date utilities
            "vendor-date": ["date-fns"]
          }
        }
      },
      // Increase chunk size warning limit (optional)
      chunkSizeWarningLimit: 500
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2QvM3JkM3JkL0Zyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbW50L2QvM3JkM3JkL0Zyb250L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9tbnQvZC8zcmQzcmQvRnJvbnQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuLy8gaW1wb3J0IGJhc2ljU3NsIGZyb20gJ0B2aXRlanMvcGx1Z2luLWJhc2ljLXNzbCcgLy8gU1NMIERpc2FibGVkIC0gVXNpbmcgVHVubmVsaW5nIGluc3RlYWRcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJ1xuXG5jb25zdCByb290RGlyID0gZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuJywgaW1wb3J0Lm1ldGEudXJsKSlcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGlzUHJvZCA9IG1vZGUgPT09ICdwcm9kdWN0aW9uJ1xuICBjb25zdCBpc0J1aWxkID0gY29tbWFuZCA9PT0gJ2J1aWxkJ1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgIC8vIFVzZSAnL0Zyb250LycgZm9yIHByb2R1Y3Rpb24gKEdpdEh1YiBQYWdlcyksICcvJyBmb3IgZGV2ZWxvcG1lbnRcbiAgICBiYXNlOiBpc1Byb2QgPyAnL0Zyb250LycgOiAnLycsXG4gICAgcmVzb2x2ZToge1xuICAgICAgLy8gXHVBQ0JEXHVCODVDIGFsaWFzIFx1QzEyNFx1QzgxNVx1QzczQ1x1Qjg1QyBpbXBvcnQgXHVBQ0JEXHVCODVDXHVCOTdDIFx1QUMwNFx1QjJFOFx1RDU1OFx1QUM4Q1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUocm9vdERpciwgJy4vc3JjJyksXG4gICAgICAgICdAZmVhdHVyZXMnOiBwYXRoLnJlc29sdmUocm9vdERpciwgJy4vc3JjL2ZlYXR1cmVzJyksXG4gICAgICAgICdAc2hhcmVkJzogcGF0aC5yZXNvbHZlKHJvb3REaXIsICcuL3NyYy9zaGFyZWQnKSxcbiAgICAgICAgJ0Bjb21wb25lbnRzJzogcGF0aC5yZXNvbHZlKHJvb3REaXIsICcuL3NyYy9zaGFyZWQvY29tcG9uZW50cycpLFxuICAgICAgICAnQGRldnRvb2xzJzogcGF0aC5yZXNvbHZlKHJvb3REaXIsICcuL3NyYy9kZXZ0b29scycpLFxuICAgICAgICAnQGhvb2tzJzogcGF0aC5yZXNvbHZlKHJvb3REaXIsICcuL3NyYy9ob29rcycpLFxuICAgICAgICAnQHBhZ2VzJzogcGF0aC5yZXNvbHZlKHJvb3REaXIsICcuL3NyYy9wYWdlcycpLFxuICAgICAgICAnQHN0eWxlcyc6IHBhdGgucmVzb2x2ZShyb290RGlyLCAnLi9zcmMvc3R5bGVzJyksXG4gICAgICAgICdAdXRpbHMnOiBwYXRoLnJlc29sdmUocm9vdERpciwgJy4vc3JjL2NvcmUvdXRpbHMnKSxcbiAgICAgICAgJ0Bjb25maWcnOiBwYXRoLnJlc29sdmUocm9vdERpciwgJy4vc3JjL2NvcmUvY29uZmlnJyksXG4gICAgICAgICdAY29yZSc6IHBhdGgucmVzb2x2ZShyb290RGlyLCAnLi9zcmMvY29yZScpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogdHJ1ZSwgICAgICAgICAvLyBcdTI3MDUgXHVDNjc4XHVCRDgwIFx1QzgxMVx1QURGQyBcdUQ1QzhcdUM2QTkgKDAuMC4wLjBcdUM3M0NcdUI4NUMgXHVCQzE0XHVDNzc4XHVCNTI5KVxuICAgICAgcG9ydDogNTE3MywgICAgICAgICAvLyBcdUFFMzBcdUJDRjggXHVEM0VDXHVEMkI4XG4gICAgICBvcGVuOiBmYWxzZSwgICAgICAgIC8vIFx1Qzc5MFx1QjNEOSBcdUJFMENcdUI3N0NcdUM2QjBcdUM4MDAgXHVDNUY0XHVBRTMwIFx1QjA0NFx1QUUzMFxuICAgICAgY29yczogdHJ1ZSwgICAgICAgICAvLyBDT1JTIFx1RDVDOFx1QzZBOVxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MCcsICAvLyBOZ2lueCBcdTIxOTIgR2F0ZXdheVx1Qjg1QyBcdUM1RjBcdUFDQjBcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgICcvd3MnOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnd3M6Ly9sb2NhbGhvc3Q6ODAnLCAgICAvLyBXZWJTb2NrZXQgdmlhIE5naW54XG4gICAgICAgICAgd3M6IHRydWUsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIFByb2R1Y3Rpb24gXHVCRTRDXHVCNERDXHVDNUQwXHVDMTFDXHVCOUNDIGNvbnNvbGUvZGVidWdnZXIgXHVDODFDXHVBQzcwXG4gICAgZXNidWlsZDogaXNCdWlsZCAmJiBpc1Byb2QgPyB7IGRyb3A6IFsnY29uc29sZScsICdkZWJ1Z2dlciddIH0gOiB7fSxcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnRVMyMDIwJyxcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgIC8vIENodW5rIHNwbGl0dGluZyBmb3IgYmV0dGVyIGNhY2hpbmcgYW5kIHBhcmFsbGVsIGxvYWRpbmdcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAvLyBSZWFjdCBjb3JlIC0gcmFyZWx5IGNoYW5nZXNcbiAgICAgICAgICAgICd2ZW5kb3ItcmVhY3QnOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgICAvLyBNVUkgY29tcG9uZW50cyAtIGxhcmdlIGJ1bmRsZSwgc2VwYXJhdGUgZm9yIGNhY2hpbmdcbiAgICAgICAgICAgICd2ZW5kb3ItbXVpJzogW1xuICAgICAgICAgICAgICAnQG11aS9tYXRlcmlhbCcsXG4gICAgICAgICAgICAgICdAbXVpL2ljb25zLW1hdGVyaWFsJyxcbiAgICAgICAgICAgICAgJ0BlbW90aW9uL3JlYWN0JyxcbiAgICAgICAgICAgICAgJ0BlbW90aW9uL3N0eWxlZCdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAvLyBEYXRhIGZldGNoaW5nIGFuZCBzdGF0ZSBtYW5hZ2VtZW50XG4gICAgICAgICAgICAndmVuZG9yLWRhdGEnOiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsICd6dXN0YW5kJywgJ2F4aW9zJ10sXG4gICAgICAgICAgICAvLyBEYXRlIHV0aWxpdGllc1xuICAgICAgICAgICAgJ3ZlbmRvci1kYXRlJzogWydkYXRlLWZucyddLFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIEluY3JlYXNlIGNodW5rIHNpemUgd2FybmluZyBsaW1pdCAob3B0aW9uYWwpXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMCxcbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJPLFNBQVMsb0JBQW9CO0FBQ3hRLE9BQU8sV0FBVztBQUVsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFKZ0gsSUFBTSwyQ0FBMkM7QUFNL0wsSUFBTSxVQUFVLGNBQWMsSUFBSSxJQUFJLEtBQUssd0NBQWUsQ0FBQztBQUczRCxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFFBQU0sU0FBUyxTQUFTO0FBQ3hCLFFBQU0sVUFBVSxZQUFZO0FBRTVCLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQTtBQUFBLElBRWpCLE1BQU0sU0FBUyxZQUFZO0FBQUEsSUFDM0IsU0FBUztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxTQUFTLE9BQU87QUFBQSxRQUNsQyxhQUFhLEtBQUssUUFBUSxTQUFTLGdCQUFnQjtBQUFBLFFBQ25ELFdBQVcsS0FBSyxRQUFRLFNBQVMsY0FBYztBQUFBLFFBQy9DLGVBQWUsS0FBSyxRQUFRLFNBQVMseUJBQXlCO0FBQUEsUUFDOUQsYUFBYSxLQUFLLFFBQVEsU0FBUyxnQkFBZ0I7QUFBQSxRQUNuRCxVQUFVLEtBQUssUUFBUSxTQUFTLGFBQWE7QUFBQSxRQUM3QyxVQUFVLEtBQUssUUFBUSxTQUFTLGFBQWE7QUFBQSxRQUM3QyxXQUFXLEtBQUssUUFBUSxTQUFTLGNBQWM7QUFBQSxRQUMvQyxVQUFVLEtBQUssUUFBUSxTQUFTLGtCQUFrQjtBQUFBLFFBQ2xELFdBQVcsS0FBSyxRQUFRLFNBQVMsbUJBQW1CO0FBQUEsUUFDcEQsU0FBUyxLQUFLLFFBQVEsU0FBUyxZQUFZO0FBQUEsTUFDN0M7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQSxNQUNOLE1BQU07QUFBQTtBQUFBLE1BQ04sTUFBTTtBQUFBO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQTtBQUFBLFVBQ1IsY0FBYztBQUFBLFFBQ2hCO0FBQUEsUUFDQSxPQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUE7QUFBQSxVQUNSLElBQUk7QUFBQSxRQUNOO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsU0FBUyxXQUFXLFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxVQUFVLEVBQUUsSUFBSSxDQUFDO0FBQUEsSUFDbEUsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBO0FBQUEsTUFFWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUE7QUFBQSxZQUVaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQTtBQUFBLFlBRXpELGNBQWM7QUFBQSxjQUNaO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBO0FBQUEsWUFFQSxlQUFlLENBQUMseUJBQXlCLFdBQVcsT0FBTztBQUFBO0FBQUEsWUFFM0QsZUFBZSxDQUFDLFVBQVU7QUFBQSxVQUM1QjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLHVCQUF1QjtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
