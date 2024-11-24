import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

function copyDir(src: string, dest: string) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read directory contents
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      fs.copyFileSync('src/manifest.json', 'dist/manifest.json');

      // Copy assets if they exist
      const assetsDir = 'src/assets';
      if (fs.existsSync(assetsDir)) {
        copyDir(assetsDir, "dist/assets")
      }
    }
  };
}

export default defineConfig({
  build: {
    target: 'chrome88',
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        // Include both the HTML and the script
        popup: resolve(__dirname, 'popup.html'),
        sidepanel: resolve(__dirname, 'side-panel.html'),
        content: resolve(__dirname, 'src/content/updated-content.ts'),
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
