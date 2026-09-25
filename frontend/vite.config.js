import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function optimizeLucide() {
  let iconMap = null;

  function loadIconMap() {
    if (iconMap) return;
    iconMap = new Map();
    try {
      const lucideMainPath = path.resolve(process.cwd(), 'node_modules/lucide-react/dist/esm/lucide-react.js');
      const content = fs.readFileSync(lucideMainPath, 'utf-8');
      const regex = /export\s+\{([^}]+)\}\s+from\s+['"]\.\/icons\/([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const exportsStr = match[1];
        const iconFile = match[2];
        const names = exportsStr.split(',').map(s => {
          const parts = s.trim().split(/\s+as\s+/);
          return parts[parts.length - 1].trim();
        });
        names.forEach(name => {
          if (name) {
            iconMap.set(name, iconFile);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to parse lucide-react export map', e);
    }
  }

  return {
    name: 'optimize-lucide-imports',
    enforce: 'pre',
    configResolved() {
      loadIconMap();
    },
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.includes('node_modules') && code.includes('lucide-react')) {
        loadIconMap();
        return code.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g, (match, importsStr) => {
          const specifiers = importsStr.split(',').map(s => s.trim()).filter(Boolean);
          const lines = specifiers.map(spec => {
            const parts = spec.split(/\s+as\s+/);
            const orig = parts[0].trim();
            const alias = parts[1] ? parts[1].trim() : orig;
            const iconFile = iconMap && iconMap.get(orig);
            if (iconFile) {
              return `import ${alias} from 'lucide-react/dist/esm/icons/${iconFile}';`;
            }
            const fallbackKebab = orig
              .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
              .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
              .toLowerCase();
            return `import ${alias} from 'lucide-react/dist/esm/icons/${fallbackKebab}.js';`;
          });
          return lines.join('\n');
        });
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [optimizeLucide(), react()],
})
