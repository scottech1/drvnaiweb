# Drvn AI Website - Share Link Handler

This website handles share links for the Drvn AI mobile app and provides smart redirection to app stores when the app is not installed.

## Setup Instructions

### 1. Update App Store URLs

In both `index.html` and `share/index.html`, update these URLs with your actual app store links:

```javascript
const APP_STORE_URLS = {
    ios: 'https://apps.apple.com/in/app/drvnai/id6748619728', // Replace YOUR_APP_ID
    android: 'https://play.google.com/store/apps/details?id=com.sgesdevllc.drvnai'
};
```

### 2. Add Your App Icon

Replace `assets/app-icon.png` with your actual app icon (recommended size: 512x512px).

### 3. Server Configuration

#### For Apache Servers:
- Upload the `.htaccess` file to your web root
- Ensure mod_rewrite is enabled

#### For Nginx Servers:
- Use the provided `nginx.conf` configuration
- Adjust paths as needed for your server setup

### 4. Domain Setup

Ensure your domain `drvnai.app` points to this website and can handle:
- `https://drvnai.app/` (main landing page)
- `https://drvnai.app/share/[token]` (share link handler)

## How It Works

### Share Link Flow:
1. User clicks share link: `https://drvnai.app/share/abc123...`
2. Website detects user's platform (iOS/Android/Web)
3. **If mobile + app installed:** Opens app directly via deep link
4. **If mobile + app not installed:** Shows countdown and redirects to app store
5. **If web:** Shows download page with app store links

### Features:
- ✅ Smart platform detection
- ✅ Deep link attempt with fallback
- ✅ App store redirection
- ✅ Mobile-optimized design
- ✅ SEO-friendly meta tags
- ✅ Error handling and fallbacks

## Testing

1. **Test deep links:** Ensure `drvnai://share/[token]` opens your app
2. **Test app store links:** Verify the URLs redirect to correct app store pages
3. **Test on different devices:** iOS, Android, and web browsers

## File Structure

```
website/
├── index.html              # Main landing page
├── share/
│   └── index.html         # Share link handler
├── assets/
│   └── app-icon.png       # App icon image
├── .htaccess              # Apache configuration
├── nginx.conf             # Nginx configuration
└── README.md              # This file
```

## Deployment

1. Upload all files to your web server
2. Configure your server (Apache/Nginx) using the provided config files
3. Update app store URLs with your actual links
4. Test the share functionality end-to-end

The website will now properly handle share links and provide a seamless user experience! 🚀