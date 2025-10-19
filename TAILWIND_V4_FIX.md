# Tailwind CSS v4 Migration Fix

## Problem
The Docker build was failing with this error:
```
[vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package...
```

## Root Cause
Tailwind CSS v4 changed how it integrates with build tools. The old PostCSS plugin approach (`tailwindcss: {}` in `postcss.config.js`) is no longer supported in v4.

## Solution
Migrated to use the official `@tailwindcss/vite` plugin instead of the PostCSS approach.

## Changes Made

### 1. **frontend/package.json**
Added `@tailwindcss/vite` to devDependencies:
```json
"@tailwindcss/vite": "^4.1.14"
```

### 2. **frontend/vite.config.js**
Updated to use the Tailwind Vite plugin:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3. **frontend/src/index.css**
Updated CSS imports for Tailwind v4 syntax:
```css
/* OLD (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* NEW (v4) */
@import "tailwindcss";
```

### 4. **frontend/postcss.config.js**
Removed `tailwindcss` from PostCSS plugins:
```javascript
export default {
  plugins: {
    autoprefixer: {},  // Kept autoprefixer
  },
}
```

## Why This Approach?

For Vite projects with Tailwind v4, there are two options:

1. **Use `@tailwindcss/vite` plugin** ✅ (Chosen)
   - Simpler configuration
   - Better integration with Vite
   - Recommended by Tailwind team for Vite

2. **Use `@tailwindcss/postcss` package**
   - More complex setup
   - Required for non-Vite projects

## Testing

To verify the fix works:

```bash
# Option 1: Build with Docker
cd /home/siru/codered-astra
docker-compose build frontend

# Option 2: Build locally
cd frontend
npm install
npm run build
```

The build should complete successfully with:
```
✓ XX modules transformed.
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.css      XX.XX kB
dist/assets/index-XXXXX.js      XXX.XX kB
✓ built in XXXXms
```

## References
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/installation/vite)
- [Tailwind v4 Vite Plugin](https://github.com/tailwindlabs/tailwindcss/tree/next/packages/%40tailwindcss-vite)

## Migration Notes
This change is backward compatible. All existing Tailwind classes and utilities will continue to work exactly as before. Only the build configuration changed, not the API.
