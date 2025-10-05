import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    plugins: [react()],
    
    // Environment variables are automatically available as import.meta.env.VITE_*
    // No need to define them manually - Vite handles this automatically
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'react-hot-toast']
          }
        }
      }
    },
    
    // Server configuration for development
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5003',
          changeOrigin: true,
          secure: false
        }
      }
    },
    
    // Preview configuration
    preview: {
      port: 3000,
      host: true
    }
  };
});
