import { mergeConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default mergeConfig(
  {
    mode: 'development',
    server: {
      host: '0.0.0.0',
      open: true,
      fs: {
        strict: true,
      },
      // proxy代理
      proxy: {
        // ===== JPAAS 相关请求（必须先匹配，避免被 /api 规则捕获）=====
        '^/api/api-bpm': {
          target: 'http://localhost:9900',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''), // /api/api-bpm/... -> /api-bpm/...
        },
        '^/api/api-form': {
          target: 'http://localhost:9900',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''), // /api/api-form/... -> /api-form/...
        },
        '^/api/api-system': {
          target: 'http://localhost:9900',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''), // /api/api-system/... -> /api-system/...
        },
        '^/api/api-user': {
          target: 'http://localhost:9900',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''), // /api/api-user/... -> /api-user/...
        },

        // ===== 直接访问格式（不带 /api 前缀）=====
        '^/api-bpm': {
          target: 'http://localhost:9900',
          changeOrigin: true,
        },
        '^/api-form': {
          target: 'http://localhost:9900',
          changeOrigin: true,
        },
        '^/api-system': {
          target: 'http://localhost:9900',
          changeOrigin: true,
        },

        // ===== 易研平台其他请求（最后匹配）=====
        '^/api': {
          target: 'http://localhost:39996',
          changeOrigin: true,
          // 注意：不要重写路径，保留 /api 前缀
        },
      },
    },
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConfig
);
