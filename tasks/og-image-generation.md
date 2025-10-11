# Generate Per-Example Open Graph Images

## Overview
Create individual Open Graph images for each Visual Effect example to improve social media sharing and SEO.

## Implementation Options

### Option 1: Static Generation at Build Time (Recommended)
Generate images once during build for best performance and caching.

**Benefits:**
- Zero runtime cost
- Images served as static files (fastest)
- Cached for a year everywhere
- No function runs on page views

**Implementation:**
```typescript
// scripts/generate-og-images.ts
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';

async function generateOGImages() {
  for (const example of examples) {
    const svg = await satori(
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
        display: 'flex',
        flexDirection: 'column',
        padding: 60,
      }}>
        <h1 style={{ fontSize: 60, color: 'white' }}>{example.name}</h1>
        <p style={{ fontSize: 30, color: '#ccc' }}>{example.description}</p>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: await fs.promises.readFile('./fonts/Inter-Bold.ttf'),
            weight: 700,
          },
        ],
      }
    );
    
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    await fs.promises.writeFile(
      `./public/og/${example.id}.png`,
      pngBuffer
    );
  }
}
```

### Option 2: Vercel Edge Function with Cache Headers
Dynamic generation with proper caching for flexibility.

```typescript
// api/og.tsx
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const example = searchParams.get('example');
  
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: 60,
      }}>
        <div style={{ fontSize: 60, fontWeight: 'bold' }}>
          {example}
        </div>
        <div style={{ fontSize: 30, opacity: 0.8, marginTop: 20 }}>
          {description}
        </div>
        <div style={{ fontSize: 24, opacity: 0.6, marginTop: 40 }}>
          Visual Effect - Interactive Effect Examples
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    }
  );
}
```

## Required Dependencies

```bash
# For static generation
npm install satori @resvg/resvg-js

# For Vercel edge functions
npm install @vercel/og
```

## Setup Steps

1. **Create OG images directory:**
   ```bash
   mkdir -p public/og
   ```

2. **Add build script to package.json:**
   ```json
   {
     "scripts": {
       "prebuild": "tsx scripts/generate-og-images.ts",
       "build": "vite build"
     }
   }
   ```

3. **Set up cache headers in vercel.json:**
   ```json
   {
     "headers": [
       {
         "source": "/og/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, immutable, max-age=31536000"
           }
         ]
       }
     ]
   }
   ```

4. **Update meta tags dynamically:**
   ```typescript
   // App.tsx
   useEffect(() => {
     const example = examples.find(e => e.id === currentHash);
     if (example) {
       document.querySelector('meta[property="og:title"]')
         ?.setAttribute('content', example.name);
       document.querySelector('meta[property="og:image"]')
         ?.setAttribute('content', `/og/${example.id}.png`);
       document.querySelector('meta[property="og:description"]')
         ?.setAttribute('content', example.description);
     }
   }, [currentHash]);
   ```

## Image Design Considerations

- **Size:** 1200x630px (standard OG image ratio)
- **Background:** Use app's dark gradient theme
- **Typography:** Large, readable fonts (60px for title, 30px for description)
- **Branding:** Include app name/logo
- **Content:** Example name, description, maybe code snippet preview
- **Colors:** Match app's color scheme (dark background, white text)

## Caching Strategy

- **CDN Level:** Vercel/Cloudflare cache at edge locations worldwide
- **Browser Level:** Long cache headers prevent re-requests
- **Social Media:** Platforms cache OG images on their servers
- **Static Files:** Best performance, no runtime cost

## Testing

1. Test OG image generation locally
2. Verify images load correctly in social media debugging tools:
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - LinkedIn Post Inspector
3. Test different screen sizes and social platforms

## Notes

- Since examples are static content, build-time generation is most efficient
- Use consistent naming: `/og/effect-succeed.png`
- Consider adding visual elements like code snippets or animated frames
- Make sure fonts are loaded properly for text rendering
- Test with different example names/descriptions for layout issues