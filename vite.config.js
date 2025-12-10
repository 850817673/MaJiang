import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      // 代理 DeepSeek API
      '/api/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepseek/, '')
      },
      // 代理 Claude API（通过你的代理服务器）
      '/api/claude': {
        target: 'http://107.174.127.190:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, '')
      }
    }
  }
})
