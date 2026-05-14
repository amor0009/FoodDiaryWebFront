import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Добавляем эти настройки
  server: {
    host: 'localhost', // Только localhost
    port: 5172,        // Кастомный порт (опционально)
    strictPort: true,  // Запретить автоматический выбор порта
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false, // Отключаем для production
    chunkSizeWarningLimit: 1500, // Увеличиваем лимит для чанков
    
    // Оптимизация сборки
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          charts: ['recharts']
        }
      }
    }
  },
  
  // Для корректных путей в production
  base: '/'
});