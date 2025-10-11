# 📱 App Icons Guide

## Required Icons for Android APK

To build an APK, you need icons in these sizes. Place them in the `public/icons/` folder.

### Required Sizes:
- `icon-72x72.png` - For older devices
- `icon-96x96.png` - For older devices  
- `icon-128x128.png` - Small icon
- `icon-144x144.png` - Medium icon
- `icon-152x152.png` - Medium icon
- `icon-192x192.png` - **Required for PWA**
- `icon-384x384.png` - Large icon
- `icon-512x512.png` - **Required for PWA**
- `icon-maskable-192x192.png` - Adaptive icon (Android)
- `icon-maskable-512x512.png` - Adaptive icon (Android)

### Optional Shortcut Icons:
- `shortcut-trending.png` (96x96)
- `shortcut-search.png` (96x96)
- `shortcut-favorites.png` (96x96)

## How to Create Icons

### Option 1: Use an Icon Generator (Easiest)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your base icon (at least 512x512 PNG)
3. Click "Download" to get all sizes
4. Extract and place in `public/icons/`

### Option 2: Use Figma/Canva
1. Create a 512x512 design
2. Export in all required sizes
3. Save to `public/icons/`

### Option 3: Use Image Editing Software
1. Create base 512x512 PNG
2. Resize to each required size
3. Save all to `public/icons/`

## Design Guidelines

### 7K Music Brand Colors:
- **Gable Green:** `#13262f` (Dark background)
- **Chathams Blue:** `#17557b` (Primary)
- **Calypso:** `#366e8d` (Secondary)
- **Timberwolf:** `#d3d0cb` (Light text)

### Icon Design Tips:
- Keep it simple and recognizable
- Use high contrast
- Avoid fine details (they blur at small sizes)
- Center the main element
- Use transparent or colored background

### Maskable Icons (Android Adaptive):
- Keep important content in the "safe zone" (center 80%)
- Background should extend to full 512x512
- Android will crop it into different shapes (circle, square, squircle)

## Quick Template

Create a simple text-based icon with "7K" text:
- Background: `#17557b` (Chathams Blue)
- Text: `#d3d0cb` (Timberwolf)
- Font: Bold, sans-serif
- Size: Large "7K" centered

##  Quick Solution

If you don't have icons yet, you can:

1. **Generate placeholder icons:**
   - Visit https://realfavicongenerator.net/
   - Upload a simple 7K logo or text image
   - Download all sizes

2. **Use PWABuilder:**
   - PWABuilder can generate icons for you when you use it to create the APK

3. **Create a simple colored square:**
   - 512x512 PNG
   - Solid `#17557b` background
   - White "7K" text in center
   - Resize to all needed sizes

## Placeholder Script

Run this after you have at least one 512x512 icon:

```powershell
# This will help resize one master icon to all sizes
# (Requires ImageMagick installed)

$master = "path/to/your-512x512-icon.png"
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $sizes) {
    magick convert $master -resize "${size}x${size}" "public/icons/icon-${size}x${size}.png"
}
```

---

**For now, PWABuilder can work without custom icons - it will generate defaults!**
