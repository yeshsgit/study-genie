import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      fs.copyFileSync('src/manifest.json', 'dist/manifest.json');

      // Copy assets if they exist
      const assetsDir = 'src/assets';
      if (fs.existsSync(assetsDir)) {
        if (!fs.existsSync('dist/assets')) {
          fs.mkdirSync('dist/assets', { recursive: true });
        }
        fs.readdirSync(assetsDir).forEach(file => {
          fs.copyFileSync(
            `${assetsDir}/${file}`,
            `dist/assets/${file}`
          );
        });
      }
    }
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        // Include both the HTML and the script
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: '[name][extname]',
      },
    },
    assetsInlineLimit: 0,
  },
  plugins: [copyManifest()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
