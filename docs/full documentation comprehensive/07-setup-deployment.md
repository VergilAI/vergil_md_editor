# Setup and Deployment Guide

## Overview

This comprehensive guide covers everything needed to set up, configure, and deploy the Dual-Pane Markdown Editor. It includes development setup, production deployment options, configuration parameters, and troubleshooting steps.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Configuration Options](#configuration-options)
5. [Build Process](#build-process)
6. [Deployment Options](#deployment-options)
7. [Server Configuration](#server-configuration)
8. [Environment Variables](#environment-variables)
9. [Security Considerations](#security-considerations)
10. [Monitoring and Logging](#monitoring-and-logging)

## Prerequisites

### System Requirements

**Minimum Requirements:**
- Node.js 16.0.0 or higher
- npm 7.0.0 or higher (or yarn 1.22.0+)
- Modern web browser with ES6+ support

**Recommended:**
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- 2GB+ available RAM for development
- 100MB+ available disk space

**Browser Support:**
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Development Tools

**Required:**
```bash
# Check Node.js version
node --version  # Should be 16.0.0+

# Check npm version
npm --version   # Should be 7.0.0+

# Optional: Install yarn
npm install -g yarn
```

**Recommended:**
- VS Code with ES6/TypeScript support
- Git for version control
- HTTP server for local development

---

## Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd md_editor

# Install dependencies
npm install

# Or using yarn
yarn install
```

### 2. Verify Installation

```bash
# Check if all dependencies are installed
npm list --depth=0

# Verify critical packages
npm list @codemirror/lang-markdown
npm list @milkdown/core
```

### 3. Start Development Server

```bash
# Start the development server
npm run dev

# This will:
# - Start HTTP server on port 8081
# - Open browser automatically
# - Watch for file changes
```

**Alternative HTTP Servers:**
```bash
# Using Python (if available)
python -m http.server 8081

# Using Node.js http-server globally
npm install -g http-server
http-server -p 8081 -o

# Using Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

### 4. Development Workflow

```bash
# Make changes to source files
# The browser will auto-refresh on file changes

# Build for testing
npm run build

# Check the built bundle
ls -la main.bundle.js
```

---

## Project Structure

### File Organization

```
md_editor/
├── docs/                              # Documentation
│   ├── full documentation comprehensive/
│   │   ├── 01-architecture-overview.md
│   │   ├── 02-technology-stack.md
│   │   ├── 03-implementation-guide.md
│   │   ├── 04-synchronization-mechanism.md
│   │   ├── 05-ui-components.md
│   │   ├── 06-api-reference.md
│   │   ├── 07-setup-deployment.md     # This file
│   │   ├── 08-testing-guide.md
│   │   ├── 09-performance.md
│   │   └── 10-troubleshooting.md
│   └── Archive/                       # Legacy documentation
├── node_modules/                      # Dependencies (not committed)
├── index.html                         # Main HTML file
├── main.js                           # Main JavaScript source
├── styles.css                        # CSS styles
├── main.bundle.js                    # Built bundle (generated)
├── package.json                      # Project configuration
├── package-lock.json                 # Dependency lock file
├── .gitignore                        # Git ignore rules
├── CLAUDE.md                         # Project guidelines
└── test.md                          # Sample markdown file
```

### Key Files Description

**Core Files:**
- `index.html` - Main application entry point
- `main.js` - Application logic and editor setup
- `styles.css` - All application styles
- `package.json` - Project dependencies and scripts

**Generated Files:**
- `main.bundle.js` - Bundled JavaScript for production
- `node_modules/` - Installed dependencies

**Configuration Files:**
- `.gitignore` - Files to exclude from version control
- `package-lock.json` - Exact dependency versions

---

## Configuration Options

### Package.json Scripts

```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "npx http-server -p 8081 -o",
    "build": "npx esbuild main.js --bundle --outfile=main.bundle.js --format=iife --global-name=MarkdownEditor --loader:.css=text"
  }
}
```

**Script Descriptions:**
- `npm run dev` - Start development server on port 8081
- `npm run build` - Bundle application for production
- `npm test` - Run tests (not implemented yet)

### Application Configuration

**Sync Configuration (in main.js):**
```javascript
const syncManager = {
    isUpdating: false,
    lastSource: null,
    debounceTimer: null,
    debounceDelay: 300,        // Sync delay in milliseconds
    scrollSync: false          // Enable/disable scroll sync
};
```

**Editor Configuration:**
```javascript
// Initial content for both editors
const initialContent = `# Welcome to the Dual-Pane Markdown Editor...`;

// CodeMirror theme
import { oneDark } from '@codemirror/theme-one-dark';

// Milkdown theme
import { nord } from '@milkdown/theme-nord';
```

### Customization Options

**Sync Delay Adjustment:**
```javascript
// Faster sync (more responsive, higher CPU usage)
syncManager.debounceDelay = 100;

// Slower sync (less responsive, lower CPU usage)
syncManager.debounceDelay = 500;
```

**Enable Scroll Synchronization:**
```javascript
// Enable synchronized scrolling between panes
syncManager.scrollSync = true;
```

**Theme Customization:**
```javascript
// Custom CodeMirror theme
import { createTheme } from '@codemirror/view';

const customTheme = createTheme({
    '&': { backgroundColor: '#1a1a1a' },
    '.cm-content': { color: '#e0e0e0' }
});
```

---

## Build Process

### Development Build

```bash
# Build for development (with source maps)
npx esbuild main.js \
  --bundle \
  --outfile=main.bundle.js \
  --format=iife \
  --global-name=MarkdownEditor \
  --sourcemap \
  --loader:.css=text
```

### Production Build

```bash
# Build for production (minified)
npm run build

# Or with additional optimizations
npx esbuild main.js \
  --bundle \
  --outfile=main.bundle.js \
  --format=iife \
  --global-name=MarkdownEditor \
  --minify \
  --loader:.css=text \
  --target=es2020
```

### Build Configuration Options

**ESBuild Options:**
```javascript
const buildOptions = {
    entryPoints: ['main.js'],
    bundle: true,
    outfile: 'main.bundle.js',
    format: 'iife',
    globalName: 'MarkdownEditor',
    minify: true,               // For production
    sourcemap: false,           // Disable for production
    target: 'es2020',           // Target modern browsers
    loader: { '.css': 'text' }, // Handle CSS imports
    external: [],               // No external dependencies
    platform: 'browser'        // Target browser environment
};
```

### Asset Optimization

**Image Optimization (if adding images):**
```bash
# Install image optimization tools
npm install --save-dev imagemin imagemin-mozjpeg imagemin-pngquant

# Optimize images during build
npx imagemin assets/images/* --out-dir=dist/images
```

**CSS Optimization:**
```bash
# Install CSS minification
npm install --save-dev cssnano postcss

# Minify CSS
npx postcss styles.css --use cssnano --output styles.min.css
```

---

## Deployment Options

### 1. Static File Hosting

**GitHub Pages:**
```bash
# Build the project
npm run build

# Create gh-pages branch (first time only)
git checkout -b gh-pages

# Add built files
git add index.html main.bundle.js styles.css

# Commit and push
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

**Netlify Deployment:**
```bash
# Option 1: Drag and drop deployment
# 1. Run `npm run build`
# 2. Drag project folder to netlify.com/drop

# Option 2: Git integration
# 1. Connect GitHub repository to Netlify
# 2. Set build command: `npm run build`
# 3. Set publish directory: `.` (root)
```

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configure build settings
# Build Command: npm run build
# Output Directory: .
```

### 2. Traditional Web Hosting

**Upload Files:**
```bash
# Required files for deployment:
index.html
main.bundle.js
styles.css

# Optional files:
test.md (sample file)
favicon.ico (if available)
```

**FTP Upload Script:**
```bash
#!/bin/bash
# upload.sh
HOST="your-ftp-host.com"
USER="your-username"
PASS="your-password"

# Build first
npm run build

# Upload essential files
lftp -c "
open -u $USER,$PASS $HOST
cd public_html
put index.html
put main.bundle.js
put styles.css
quit
"
```

### 3. Docker Deployment

**Dockerfile:**
```dockerfile
FROM nginx:alpine

# Copy application files
COPY index.html /usr/share/nginx/html/
COPY main.bundle.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/

# Copy nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**
```bash
# Build Docker image
docker build -t md-editor .

# Run container
docker run -p 8080:80 md-editor

# Access at http://localhost:8080
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  md-editor:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

### 4. Node.js Server Deployment

**Express Server (optional enhancement):**
```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**PM2 Deployment:**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "md-editor"

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## Server Configuration

### Nginx Configuration

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/md-editor;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Handle all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache Configuration

**.htaccess:**
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"

# Fallback to index.html for SPA
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### CDN Configuration

**CloudFlare Settings:**
```javascript
// Page Rules
// Rule 1: Cache Everything
// URL: your-domain.com/*
// Settings: Cache Level = Cache Everything

// Rule 2: Browser Cache TTL
// URL: your-domain.com/*.js
// Settings: Browser Cache TTL = 1 year

// Rule 3: Browser Cache TTL
// URL: your-domain.com/*.css
// Settings: Browser Cache TTL = 1 year
```

---

## Environment Variables

### Development Environment

**package.json Environment Scripts:**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development npx http-server -p 8081 -o",
    "build:dev": "NODE_ENV=development npm run build",
    "build:prod": "NODE_ENV=production npm run build"
  }
}
```

### Environment-Specific Configuration

**config.js (optional enhancement):**
```javascript
const config = {
    development: {
        syncDelay: 100,
        scrollSync: true,
        debug: true,
        apiUrl: 'http://localhost:3000'
    },
    production: {
        syncDelay: 300,
        scrollSync: false,
        debug: false,
        apiUrl: 'https://api.your-domain.com'
    }
};

export default config[process.env.NODE_ENV || 'development'];
```

### Docker Environment Variables

**Docker Environment:**
```bash
# Set environment variables
docker run -e NODE_ENV=production -p 8080:80 md-editor

# Using environment file
echo "NODE_ENV=production" > .env
docker run --env-file .env -p 8080:80 md-editor
```

---

## Security Considerations

### Content Security Policy

**CSP Header:**
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               font-src 'self' data:;
               connect-src 'self';">
```

### HTTPS Configuration

**Nginx HTTPS:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Your existing configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Input Sanitization

While the editor handles markdown content, consider:

```javascript
// Basic content validation
function validateContent(content) {
    // Check content length
    if (content.length > 100000) {
        throw new Error('Content too long');
    }

    // Basic XSS prevention (if rendering HTML)
    const sanitized = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');

    return sanitized;
}
```

---

## Monitoring and Logging

### Basic Error Logging

**Error Tracking:**
```javascript
// Add to main.js
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);

    // Send to logging service (optional)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
```

### Performance Monitoring

**Basic Performance Tracking:**
```javascript
// Add to main.js
function trackPerformance() {
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', navigation.loadEventEnd - navigation.fetchStart);

        const paint = performance.getEntriesByType('paint');
        paint.forEach(entry => {
            console.log(`${entry.name}: ${entry.startTime}ms`);
        });
    }
}

// Call after initialization
window.addEventListener('load', trackPerformance);
```

### Health Check Endpoint

**Basic Health Check (for server deployments):**
```javascript
// Add to server.js if using Node.js server
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

This comprehensive setup and deployment guide provides all the necessary information to successfully deploy the Dual-Pane Markdown Editor in various environments, from development to production. Each section includes practical examples and best practices for secure, performant deployments.