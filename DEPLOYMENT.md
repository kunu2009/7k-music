# 🚀 Deployment Guide - 7K Music

Complete guide for deploying your 7K Music app to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] YouTube API key is obtained and working
- [ ] `.env` file is configured locally
- [ ] App runs successfully in development (`npm run dev`)
- [ ] Production build works (`npm run build`)
- [ ] All features tested (search, favorites, playlists, player)
- [ ] Legal documentation is in place
- [ ] `.gitignore` includes `.env`

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Why Vercel?**
- Free hosting for static sites
- Automatic HTTPS
- Global CDN
- Easy environment variables
- CI/CD integration
- Zero configuration

#### Deploy via CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variable:
   - Key: `VITE_YOUTUBE_API_KEY`
   - Value: Your API key
7. Click "Deploy"

**Your app will be live at**: `https://your-app.vercel.app`

---

### Option 2: Netlify

**Why Netlify?**
- Free tier available
- Form handling
- Serverless functions
- Split testing
- Analytics

#### Deploy via Netlify CLI

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Deploy via Drag & Drop

1. Build your app:
   ```powershell
   npm run build
   ```

2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `dist/` folder
4. Go to Site Settings → Build & Deploy → Environment
5. Add `VITE_YOUTUBE_API_KEY` variable
6. Trigger a redeploy

**Your app will be live at**: `https://your-app.netlify.app`

---

### Option 3: GitHub Pages

**Why GitHub Pages?**
- Free hosting
- Custom domain support
- GitHub integration
- Simple setup

#### Setup

1. Install gh-pages:
   ```powershell
   npm install --save-dev gh-pages
   ```

2. Update `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/7k-music",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/7k-music/', // Your repo name
     // ... rest of config
   })
   ```

4. Deploy:
   ```powershell
   npm run deploy
   ```

**Note**: Environment variables must be set during build time. Consider using GitHub Actions for automated builds.

---

### Option 4: Firebase Hosting

**Why Firebase?**
- Google infrastructure
- Custom domain support
- SSL certificate included
- Fast global CDN

#### Setup

1. Install Firebase CLI:
   ```powershell
   npm install -g firebase-tools
   ```

2. Login:
   ```powershell
   firebase login
   ```

3. Initialize:
   ```powershell
   firebase init hosting
   ```

4. Configure `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. Build and deploy:
   ```powershell
   npm run build
   firebase deploy
   ```

**Your app will be live at**: `https://your-project.web.app`

---

### Option 5: Azure Static Web Apps

**Why Azure?**
- Microsoft infrastructure
- Free tier available
- API integration
- Custom authentication

#### Deploy via Azure Portal

1. Build your app:
   ```powershell
   npm run build
   ```

2. Go to [Azure Portal](https://portal.azure.com)
3. Create "Static Web App"
4. Configure:
   - App location: `/`
   - API location: (leave blank)
   - Output location: `dist`
5. Deploy

---

### Option 6: AWS Amplify

**Why AWS Amplify?**
- Amazon infrastructure
- Auto scaling
- Backend integration
- Custom domain support

#### Deploy via Amplify Console

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click "New app" → "Host web app"
4. Connect your repository
5. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
6. Add environment variable `VITE_YOUTUBE_API_KEY`
7. Deploy

---

## 🔐 Environment Variables Setup

### For All Platforms

You need to set these environment variables in your hosting platform:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_YOUTUBE_API_KEY` | Your API key | **Required** - YouTube Data API v3 key |
| `VITE_JAMENDO_CLIENT_ID` | Your client ID | *Optional* - For Creative Commons music |

### Platform-Specific Instructions

**Vercel:**
- Dashboard → Project Settings → Environment Variables

**Netlify:**
- Site Settings → Build & Deploy → Environment → Environment Variables

**GitHub Pages:**
- Use GitHub Actions secrets and build-time injection

**Firebase:**
- Set during build in CI/CD or use Firebase Functions

**Azure:**
- Configuration → Application Settings

**AWS Amplify:**
- App Settings → Environment Variables

---

## 🌐 Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `music.7kapps.com`)
3. Update DNS records:
   ```
   Type: CNAME
   Name: music
   Value: cname.vercel-dns.com
   ```

### Netlify

1. Go to Domain Management → Add custom domain
2. Update DNS:
   ```
   Type: CNAME
   Name: music
   Value: your-site.netlify.app
   ```

### GitHub Pages

1. Go to repository Settings → Pages
2. Add custom domain
3. Update DNS:
   ```
   Type: CNAME
   Name: music
   Value: yourusername.github.io
   ```

---

## 🔒 Security Best Practices

### API Key Protection

**⚠️ Important**: In client-side apps, API keys are visible. To protect:

1. **Restrict API Key** in Google Cloud Console:
   - Set HTTP referrers (websites)
   - Limit to specific domains
   - Example: `https://music.7kapps.com/*`

2. **Monitor Usage**:
   - Check Google Cloud Console quotas daily
   - Set up usage alerts
   - Monitor for unusual activity

3. **Rate Limiting**:
   - Implement client-side caching
   - Debounce search requests
   - Limit API calls per user

### HTTPS

All platforms provide free HTTPS. Ensure:
- [ ] Force HTTPS redirect enabled
- [ ] HSTS headers configured
- [ ] Mixed content warnings resolved

---

## 📊 Performance Optimization

### Before Deploying

1. **Optimize Build**:
   ```powershell
   npm run build
   ```

2. **Analyze Bundle**:
   ```powershell
   npm install -g vite-bundle-visualizer
   npx vite-bundle-visualizer
   ```

3. **Check Lighthouse Score**:
   - Open deployed site
   - Press F12 → Lighthouse
   - Run audit
   - Aim for 90+ in all categories

### Optimization Checklist

- [ ] Images optimized (WebP format)
- [ ] Lazy loading implemented
- [ ] Code splitting enabled
- [ ] Service worker configured
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured
- [ ] Cache headers set

---

## 📈 Monitoring & Analytics

### Google Analytics (Optional)

If you want to track usage:

1. Create GA4 property
2. Add tracking code to `index.html`:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

### YouTube Analytics

Monitor your API usage:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to APIs & Services → Dashboard
4. Check YouTube Data API v3 metrics

### Error Monitoring (Optional)

Consider using:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Performance monitoring

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Automated Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

Set secrets in GitHub:
- Repository Settings → Secrets → Actions
- Add `YOUTUBE_API_KEY`, `VERCEL_TOKEN`, etc.

---

## 🧪 Testing Before Going Live

### Pre-Launch Checklist

1. **Functionality**:
   - [ ] Home page loads trending videos
   - [ ] Search works
   - [ ] Videos play correctly
   - [ ] Favorites can be added/removed
   - [ ] Playlists can be created/deleted
   - [ ] Player controls work (play, pause, next, previous)

2. **Cross-Browser Testing**:
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge
   - [ ] Mobile browsers

3. **Performance**:
   - [ ] Lighthouse score 90+
   - [ ] Loading time < 3s
   - [ ] No console errors
   - [ ] Service worker registered

4. **Legal**:
   - [ ] YouTube branding visible
   - [ ] Legal documentation accessible
   - [ ] Terms of Service linked
   - [ ] No download features

---

## 🎉 Post-Deployment

### After Going Live

1. **Test Production Site**:
   - Visit your deployed URL
   - Test all features
   - Check mobile responsiveness

2. **Set Up Monitoring**:
   - Configure uptime monitoring
   - Set up error alerts
   - Monitor API quota usage

3. **Share Your App**:
   - Social media announcement
   - Product Hunt launch
   - Reddit communities
   - Tech blogs

4. **Collect Feedback**:
   - Add feedback form
   - Monitor GitHub issues
   - Track user analytics

---

## 🆘 Troubleshooting Deployment Issues

### "Build Failed"

**Solution**:
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

### "Environment Variable Not Found"

**Solution**:
- Verify variable name is exactly `VITE_YOUTUBE_API_KEY`
- Check platform's environment variable settings
- Trigger manual rebuild

### "Videos Not Playing in Production"

**Solution**:
- Check browser console for errors
- Verify API key restrictions allow your domain
- Check CORS settings

### "PWA Not Installing"

**Solution**:
- Must be served over HTTPS
- Check `manifest.json` is accessible
- Verify service worker is registered
- Check browser console for PWA errors

---

## 📞 Need Help?

- 📧 Email: support@7kapps.com
- 🐛 GitHub Issues: Report bugs
- 💬 Discord: Join our community (coming soon)

---

## 🎊 You're Ready to Deploy!

Follow the steps above for your chosen platform, and your 7K Music app will be live! 🚀

**Good luck, and happy deploying!** 🎵

---

**Made with ❤️ by 7K Apps**  
*Play. Discover. Create — Legally.*
