# Legal & Ethical Compliance Documentation

## 7K Music - Legal Framework

This document outlines the legal and ethical foundations of the 7K Music application.

---

## 🎯 Core Principles

### 1. **100% Legal Content Streaming**
- All content is streamed through **official YouTube APIs**
- No downloading or extraction of copyrighted material
- No bypassing of YouTube's access controls or DRM

### 2. **YouTube Terms of Service Compliance**
- We comply with [YouTube Terms of Service](https://www.youtube.com/t/terms)
- We comply with [YouTube API Services Terms](https://developers.google.com/youtube/terms/api-services-terms-of-service)
- We comply with [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)

### 3. **No Copyright Infringement**
- We do NOT store, cache, or redistribute copyrighted video/audio files
- All content remains on YouTube's servers
- Users stream content directly from YouTube

---

## ✅ What We DO (Legal & Ethical)

### Content Delivery
- ✅ Embed videos using **YouTube IFrame Player API**
- ✅ Fetch metadata using **YouTube Data API v3**
- ✅ Display YouTube branding and controls as required
- ✅ Respect content ownership and attribution

### Data Storage
- ✅ Cache **app shell** (HTML, CSS, JS) for offline functionality
- ✅ Cache **YouTube thumbnails** (public, non-copyrighted images)
- ✅ Store **video IDs and metadata** for user playlists
- ✅ Store **user preferences** locally (favorites, settings)

### User Experience
- ✅ Provide navigation and discovery features
- ✅ Allow users to create personal playlists
- ✅ Show trending and popular music videos
- ✅ Enable search functionality

---

## ❌ What We DON'T DO (Prohibited)

### Content Extraction
- ❌ **NO** downloading of video files
- ❌ **NO** downloading of audio files
- ❌ **NO** stream ripping or extraction
- ❌ **NO** conversion to MP3 or other formats

### API Violations
- ❌ **NO** removing YouTube branding
- ❌ **NO** hiding required controls
- ❌ **NO** modifying video player behavior beyond API specifications
- ❌ **NO** circumventing ads or monetization

### Content Redistribution
- ❌ **NO** storing copyrighted content on our servers
- ❌ **NO** redistributing YouTube content
- ❌ **NO** creating derivative works from copyrighted material
- ❌ **NO** bypassing geographic restrictions

---

## 📜 API Compliance Details

### YouTube Data API v3

**Permitted Uses:**
- Searching for videos
- Retrieving video metadata (title, description, thumbnails)
- Getting trending videos by category
- Fetching video statistics (views, likes)

**Required Attributions:**
- YouTube branding displayed in app
- Links to original YouTube videos
- Creator attribution (channel name)

### YouTube IFrame Player API

**Permitted Uses:**
- Embedding YouTube videos for playback
- Basic playback controls (play, pause, seek)
- Volume control
- Quality selection

**Required Features:**
- YouTube logo visible
- "Watch on YouTube" link accessible
- Standard YouTube player controls
- Ads displayed when present

---

## 🔒 Privacy & Data Protection

### User Data We Collect
- **NONE** - We do not collect personal information
- All data is stored **locally** in the user's browser (IndexedDB)
- No user tracking or analytics beyond YouTube's embedded player

### Data We Store Locally
- Video IDs (public identifiers)
- Video metadata (title, thumbnail URLs, channel names)
- User's playlist names
- User's favorites list
- Playback preferences

### Third-Party Data Sharing
- **NONE** - We do not share data with third parties
- YouTube receives standard playback data through their embedded player
- No additional tracking pixels or analytics

---

## 🌍 Geographic & Content Restrictions

### Respect for Regional Restrictions
- We respect YouTube's geographic content restrictions
- Videos blocked in user's region will not play
- We do not provide VPN or proxy functionality
- We do not bypass age restrictions

### Content Filtering
- We filter for music category using YouTube's categoryId
- We rely on YouTube's content moderation
- We do not override YouTube's content policies

---

## 📋 Disclaimer for Users

**By using 7K Music, users acknowledge:**

1. **Content Source**: All video content is sourced from YouTube and subject to YouTube's Terms of Service.

2. **Content Ownership**: Users do not gain any ownership rights to streamed content.

3. **No Offline Playback**: Music videos cannot be played offline; internet connection is required.

4. **Third-Party Service**: 7K Music is not affiliated with, endorsed by, or sponsored by YouTube or Google.

5. **API Limitations**: Service availability depends on YouTube API quota and service status.

6. **Content Availability**: Videos may become unavailable due to copyright claims, regional restrictions, or removal by creators.

---

## ⚖️ Legal Risks Mitigation

### How We Minimize Legal Risk

1. **API Compliance**
   - Use only official, documented APIs
   - Follow all API usage guidelines
   - Display required attributions

2. **No Content Hosting**
   - Zero storage of copyrighted material
   - All content streams from YouTube
   - Only metadata stored locally

3. **Transparent Operation**
   - Open-source codebase (optional)
   - Clear documentation
   - Visible YouTube branding

4. **Respect for Copyright**
   - No tools for downloading
   - No audio extraction features
   - No format conversion

5. **User Education**
   - Clear legal documentation
   - Prominent disclaimers
   - Links to YouTube ToS

---

## 🚫 Prohibited Feature Requests

The following features will **NEVER** be implemented as they violate legal/ethical guidelines:

1. ❌ Download video files
2. ❌ Extract audio to MP3
3. ❌ Remove ads from videos
4. ❌ Hide YouTube branding
5. ❌ Bypass geographic restrictions
6. ❌ Background audio without YouTube player
7. ❌ Offline video playback of copyrighted content
8. ❌ Video/audio editing of copyrighted content

---

## ✅ Safe Feature Additions

The following features are **legally compliant** and may be added:

1. ✅ Creative Commons music integration (properly licensed)
2. ✅ Royalty-free music libraries (Jamendo, FMA, etc.)
3. ✅ Enhanced playlist organization
4. ✅ Music discovery algorithms
5. ✅ Social sharing (links to YouTube)
6. ✅ Lyrics display (from licensed APIs)
7. ✅ Theme customization
8. ✅ Export playlists (as video ID lists)

---

## 📞 DMCA & Copyright Complaints

### Content Removal Process

If you believe content accessible through 7K Music infringes your copyright:

1. **Contact YouTube Directly**: All content is hosted by YouTube. File a DMCA takedown notice with YouTube: https://www.youtube.com/copyright_complaint_form

2. **Contact Us**: If you believe our app facilitates infringement, email: legal@7kapps.com

We will respond within 48 hours and cooperate fully with legitimate legal requests.

---

## 📄 Licenses

### Application Code
- **License**: MIT License
- **Copyright**: © 2025 7K Apps
- **Rights**: Open-source, free to use with attribution

### Third-Party Dependencies
See `package.json` for full list of dependencies and their licenses.

### Content
- **YouTube Videos**: Copyright belongs to respective creators/rights holders
- **Thumbnails**: Property of YouTube/content creators
- **Metadata**: Publicly available information from YouTube

---

## 🔄 Updates to This Policy

This legal compliance document may be updated to reflect:
- Changes in YouTube API Terms of Service
- Changes in applicable laws
- Addition of new features
- User feedback and concerns

**Last Updated**: 2025-01-01

---

## ⚠️ Important Notice

**7K Music is an independent application and is not affiliated with, endorsed by, sponsored by, or approved by YouTube, Google, or Alphabet Inc.**

**All trademarks, logos, and brand names are the property of their respective owners.**

---

## 📧 Legal Contact

For legal inquiries, concerns, or compliance questions:

**Email**: legal@7kapps.com  
**Response Time**: 24-48 hours

---

**Built with respect for creators, copyright, and the law.**

*7K Apps — Play. Discover. Create — Legally.*
