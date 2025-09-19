# Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide provides solutions for common issues, debugging techniques, and frequently asked questions for the Dual-Pane Markdown Editor. It covers installation problems, runtime errors, performance issues, and user experience problems.

## Table of Contents

1. [Common Issues](#common-issues)
2. [Installation and Setup Problems](#installation-and-setup-problems)
3. [Runtime Errors](#runtime-errors)
4. [Synchronization Issues](#synchronization-issues)
5. [Performance Problems](#performance-problems)
6. [Browser Compatibility](#browser-compatibility)
7. [UI and Layout Issues](#ui-and-layout-issues)
8. [Debugging Techniques](#debugging-techniques)
9. [Error Recovery](#error-recovery)
10. [Frequently Asked Questions](#frequently-asked-questions)

## Common Issues

### Issue Categories

**Critical Issues (High Priority):**
- Editor fails to initialize
- Content synchronization stops working
- Application crashes or becomes unresponsive
- Data loss during editing

**Medium Priority Issues:**
- UI elements not responding correctly
- Performance degradation
- Browser-specific problems
- Theme or styling issues

**Low Priority Issues:**
- Minor UI inconsistencies
- Feature enhancement requests
- Documentation clarifications

### Quick Diagnostics

**Health Check Script:**
```javascript
class EditorHealthChecker {
    constructor() {
        this.checks = [];
        this.results = {};
    }

    async runHealthCheck() {
        console.log('Running editor health check...');

        await this.checkBasicFunctionality();
        await this.checkDependencies();
        await this.checkSyncSystem();
        await this.checkPerformance();
        await this.checkBrowserSupport();

        return this.generateReport();
    }

    async checkBasicFunctionality() {
        const checks = {
            'DOM elements present': this.checkDOMElements(),
            'Event listeners attached': this.checkEventListeners(),
            'Editors initialized': this.checkEditorInstances(),
            'CSS loaded correctly': this.checkStyles()
        };

        this.results.basicFunctionality = checks;
    }

    checkDOMElements() {
        const requiredElements = [
            'editor-container',
            'codemirror-editor',
            'milkdown-editor',
            'divider',
            'status-bar'
        ];

        return requiredElements.every(id => document.getElementById(id) !== null);
    }

    checkEventListeners() {
        try {
            // Check if toolbar buttons have event listeners
            const buttons = document.querySelectorAll('.toolbar .btn');
            return buttons.length > 0 && Array.from(buttons).every(btn =>
                getEventListeners(btn).click && getEventListeners(btn).click.length > 0
            );
        } catch (error) {
            return false;
        }
    }

    checkEditorInstances() {
        return window.codemirrorView !== null && window.milkdownEditor !== null;
    }

    checkStyles() {
        const container = document.querySelector('.editor-container');
        if (!container) return false;

        const styles = getComputedStyle(container);
        return styles.display === 'flex' && styles.flexDirection === 'column';
    }

    async checkDependencies() {
        const dependencies = {
            'CodeMirror': typeof EditorView !== 'undefined',
            'Milkdown': typeof Editor !== 'undefined',
            'ES6 Support': typeof Promise !== 'undefined' && typeof Map !== 'undefined',
            'Local Storage': this.checkLocalStorage()
        };

        this.results.dependencies = dependencies;
    }

    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (error) {
            return false;
        }
    }

    async checkSyncSystem() {
        const syncChecks = {
            'Sync manager initialized': typeof syncManager !== 'undefined',
            'Debounce system working': this.checkDebounceSystem(),
            'Status indicators present': this.checkStatusIndicators(),
            'Content validation working': this.checkContentValidation()
        };

        this.results.syncSystem = syncChecks;
    }

    checkDebounceSystem() {
        return syncManager &&
               typeof syncManager.debounceDelay === 'number' &&
               syncManager.debounceDelay > 0;
    }

    checkStatusIndicators() {
        const indicators = ['codemirror-status', 'milkdown-status', 'sync-indicator'];
        return indicators.every(id => document.getElementById(id) !== null);
    }

    checkContentValidation() {
        try {
            // Test basic content operations
            const testContent = '# Test';
            return typeof testContent === 'string' && testContent.length > 0;
        } catch (error) {
            return false;
        }
    }

    async checkPerformance() {
        const performanceChecks = {
            'Memory usage reasonable': await this.checkMemoryUsage(),
            'No long tasks detected': this.checkLongTasks(),
            'Frame rate acceptable': this.checkFrameRate(),
            'Bundle size reasonable': this.checkBundleSize()
        };

        this.results.performance = performanceChecks;
    }

    async checkMemoryUsage() {
        if (!('memory' in performance)) return true; // Can't check

        const memory = performance.memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        return usedMB < 100; // Less than 100MB
    }

    checkLongTasks() {
        // Simple check - no obvious blocking operations
        const start = performance.now();
        for (let i = 0; i < 100000; i++) {
            // Simulate work
        }
        const end = performance.now();
        return (end - start) < 50; // Less than 50ms for simple operations
    }

    checkFrameRate() {
        // Basic responsiveness check
        return !document.documentElement.classList.contains('performance-warning');
    }

    checkBundleSize() {
        // Check if bundle seems reasonable (indirect check)
        const scripts = document.querySelectorAll('script[src]');
        return scripts.length > 0; // At least main bundle should be present
    }

    async checkBrowserSupport() {
        const browserChecks = {
            'ES6+ support': this.checkES6Support(),
            'Modern CSS support': this.checkCSSSupport(),
            'Required APIs': this.checkRequiredAPIs(),
            'Performance APIs': this.checkPerformanceAPIs()
        };

        this.results.browserSupport = browserChecks;
    }

    checkES6Support() {
        try {
            // Test arrow functions, destructuring, etc.
            const test = () => ({ a: 1, ...{ b: 2 } });
            const { a, b } = test();
            return a === 1 && b === 2;
        } catch (error) {
            return false;
        }
    }

    checkCSSSupport() {
        return CSS.supports('display', 'flex') &&
               CSS.supports('grid-template-columns', '1fr 1fr');
    }

    checkRequiredAPIs() {
        return 'requestAnimationFrame' in window &&
               'MutationObserver' in window &&
               'ResizeObserver' in window;
    }

    checkPerformanceAPIs() {
        return 'performance' in window &&
               'PerformanceObserver' in window;
    }

    generateReport() {
        const allPassed = Object.values(this.results).every(category =>
            Object.values(category).every(check => check === true)
        );

        return {
            overall: allPassed ? 'PASS' : 'ISSUES_DETECTED',
            timestamp: new Date().toISOString(),
            details: this.results,
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];

        // Check each category for failed tests
        Object.entries(this.results).forEach(([category, checks]) => {
            Object.entries(checks).forEach(([check, passed]) => {
                if (!passed) {
                    recommendations.push(this.getRecommendation(category, check));
                }
            });
        });

        return recommendations;
    }

    getRecommendation(category, check) {
        const recommendations = {
            'basicFunctionality': {
                'DOM elements present': 'Ensure all required HTML elements are present in index.html',
                'Event listeners attached': 'Check that initializeToolbar() is called after DOM load',
                'Editors initialized': 'Verify CodeMirror and Milkdown initialization completes',
                'CSS loaded correctly': 'Check that styles.css is properly loaded'
            },
            'dependencies': {
                'CodeMirror': 'Ensure CodeMirror is properly imported and bundled',
                'Milkdown': 'Verify Milkdown dependencies are installed and imported',
                'ES6 Support': 'Browser may not support required JavaScript features',
                'Local Storage': 'Browser may have storage restrictions'
            },
            'syncSystem': {
                'Sync manager initialized': 'Check that syncManager object is properly created',
                'Debounce system working': 'Verify debounce timer configuration',
                'Status indicators present': 'Ensure status elements exist in HTML',
                'Content validation working': 'Check content processing functions'
            },
            'performance': {
                'Memory usage reasonable': 'Consider reducing memory usage or running cleanup',
                'No long tasks detected': 'Optimize blocking operations',
                'Frame rate acceptable': 'Check for performance bottlenecks',
                'Bundle size reasonable': 'Consider code splitting or dependency optimization'
            },
            'browserSupport': {
                'ES6+ support': 'Browser may need updating or polyfills required',
                'Modern CSS support': 'Consider CSS fallbacks for older browsers',
                'Required APIs': 'Some browser APIs may not be available',
                'Performance APIs': 'Performance monitoring may be limited'
            }
        };

        return recommendations[category]?.[check] || 'Check documentation for specific guidance';
    }
}

// Usage
const healthChecker = new EditorHealthChecker();
// healthChecker.runHealthCheck().then(report => console.log(report));
```

---

## Installation and Setup Problems

### Problem: npm install fails

**Symptoms:**
- Error messages during `npm install`
- Missing dependencies
- Version conflicts

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

2. **Check Node.js version:**
```bash
node --version  # Should be 16.0.0+
npm --version   # Should be 7.0.0+
```

3. **Use specific npm registry:**
```bash
npm install --registry https://registry.npmjs.org/
```

4. **Install with legacy peer deps:**
```bash
npm install --legacy-peer-deps
```

### Problem: Build process fails

**Symptoms:**
- `npm run build` fails
- ESBuild errors
- Bundle not generated

**Solutions:**

1. **Check ESBuild installation:**
```bash
npm list esbuild
npx esbuild --version
```

2. **Manual build with verbose output:**
```bash
npx esbuild main.js --bundle --outfile=main.bundle.js --format=iife --global-name=MarkdownEditor --loader:.css=text --log-level=verbose
```

3. **Check for file permissions:**
```bash
ls -la main.js
chmod 644 main.js
```

4. **Alternative build tool:**
```bash
# If ESBuild fails, try with webpack
npm install --save-dev webpack webpack-cli
npx webpack main.js --mode=development --output-filename=main.bundle.js
```

### Problem: Development server won't start

**Symptoms:**
- `npm run dev` fails
- Port already in use
- Server not accessible

**Solutions:**

1. **Check port availability:**
```bash
lsof -i :8081
netstat -an | grep 8081
```

2. **Use different port:**
```bash
npx http-server -p 8082 -o
```

3. **Alternative HTTP servers:**
```bash
# Python
python -m http.server 8081

# Node.js
npx serve -l 8081

# PHP
php -S localhost:8081
```

4. **Check firewall settings:**
```bash
# macOS
sudo pfctl -sr | grep 8081

# Linux
sudo ufw status
```

---

## Runtime Errors

### Problem: "Cannot read property of undefined" errors

**Symptoms:**
- JavaScript errors in browser console
- Application doesn't function properly
- Missing object properties

**Common Causes and Solutions:**

1. **DOM elements not found:**
```javascript
// Problem
const element = document.getElementById('editor-container');
element.appendChild(child); // Error if element is null

// Solution
const element = document.getElementById('editor-container');
if (element) {
    element.appendChild(child);
} else {
    console.error('Editor container not found');
}
```

2. **Editor instances not initialized:**
```javascript
// Problem
codemirrorView.dispatch(transaction); // Error if codemirrorView is null

// Solution
if (codemirrorView && codemirrorView.dispatch) {
    codemirrorView.dispatch(transaction);
} else {
    console.error('CodeMirror not initialized');
}
```

3. **Async initialization race conditions:**
```javascript
// Problem
async function initialize() {
    initializeCodeMirror();
    await initializeMilkdown();
    setupSync(); // May run before Milkdown is ready
}

// Solution
async function initialize() {
    initializeCodeMirror();
    await initializeMilkdown();
    // Ensure both editors are ready
    if (codemirrorView && milkdownEditor) {
        setupSync();
    }
}
```

### Problem: Module import errors

**Symptoms:**
- "Module not found" errors
- Import/export syntax errors
- Bundle fails to load

**Solutions:**

1. **Check import paths:**
```javascript
// Problem
import { EditorState } from 'codemirror/state';

// Solution
import { EditorState } from '@codemirror/state';
```

2. **Verify package installation:**
```bash
npm list @codemirror/state
npm install @codemirror/state --save
```

3. **Check bundle generation:**
```bash
# Rebuild bundle
npm run build

# Check bundle contents
ls -la main.bundle.js
head -20 main.bundle.js
```

### Problem: Memory leaks and performance degradation

**Symptoms:**
- Application becomes slow over time
- Browser tab uses excessive memory
- UI becomes unresponsive

**Detection:**
```javascript
// Memory leak detector
class MemoryLeakDetector {
    constructor() {
        this.baseline = null;
        this.samples = [];
    }

    setBaseline() {
        if ('memory' in performance) {
            this.baseline = performance.memory.usedJSHeapSize;
        }
    }

    checkForLeaks() {
        if (!this.baseline || !('memory' in performance)) return;

        const current = performance.memory.usedJSHeapSize;
        const growth = current - this.baseline;
        this.samples.push(growth);

        // Keep last 10 samples
        if (this.samples.length > 10) {
            this.samples.shift();
        }

        // Check for consistent growth
        const avgGrowth = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
        if (avgGrowth > 10 * 1024 * 1024) { // 10MB
            console.warn('Potential memory leak detected:', avgGrowth / (1024 * 1024), 'MB growth');
            return true;
        }

        return false;
    }
}

const leakDetector = new MemoryLeakDetector();
leakDetector.setBaseline();

// Check every 30 seconds
setInterval(() => leakDetector.checkForLeaks(), 30000);
```

**Solutions:**

1. **Clear event listeners:**
```javascript
function cleanup() {
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Clear timers
    if (syncManager.debounceTimer) {
        clearTimeout(syncManager.debounceTimer);
        syncManager.debounceTimer = null;
    }

    // Clean up editor instances
    if (codemirrorView) {
        codemirrorView.destroy();
        codemirrorView = null;
    }
}
```

2. **Use WeakMap for associations:**
```javascript
// Instead of regular Map
const elementData = new WeakMap();

// Store data
elementData.set(element, { handler: myHandler });

// Data is automatically cleaned up when element is removed
```

---

## Synchronization Issues

### Problem: Content sync stops working

**Symptoms:**
- Changes in one editor don't appear in the other
- Sync status shows "error" or gets stuck on "syncing"
- Content becomes out of sync between panes

**Debugging Steps:**

1. **Check sync manager state:**
```javascript
function debugSyncState() {
    console.log('Sync Manager State:', {
        isUpdating: syncManager.isUpdating,
        lastSource: syncManager.lastSource,
        debounceTimer: syncManager.debounceTimer,
        debounceDelay: syncManager.debounceDelay
    });

    // Check editor instances
    console.log('Editor Instances:', {
        codemirror: !!codemirrorView,
        milkdown: !!milkdownEditor
    });

    // Check if sync functions exist
    console.log('Sync Functions:', {
        syncToMilkdown: typeof syncToMilkdown,
        syncToCodeMirror: typeof syncToCodeMirror
    });
}
```

2. **Test sync manually:**
```javascript
async function testSync() {
    const testContent = '# Test Sync\n\nThis is a test.';

    try {
        console.log('Testing sync to Milkdown...');
        await syncToMilkdown(testContent);
        console.log('Sync to Milkdown successful');

        console.log('Testing sync to CodeMirror...');
        syncToCodeMirror({
            get: (key) => {
                if (key === 'serializerCtx') {
                    return () => testContent;
                }
                if (key === 'editorViewCtx') {
                    return { state: { doc: 'test' } };
                }
            }
        });
        console.log('Sync to CodeMirror successful');
    } catch (error) {
        console.error('Sync test failed:', error);
    }
}
```

**Solutions:**

1. **Reset sync state:**
```javascript
function resetSyncState() {
    syncManager.isUpdating = false;
    syncManager.lastSource = null;

    if (syncManager.debounceTimer) {
        clearTimeout(syncManager.debounceTimer);
        syncManager.debounceTimer = null;
    }

    // Update UI indicators
    document.getElementById('codemirror-status').textContent = 'Ready';
    document.getElementById('milkdown-status').textContent = 'Ready';
    document.getElementById('sync-indicator').textContent = 'Synced';

    console.log('Sync state reset');
}
```

2. **Reinitialize editors:**
```javascript
async function reinitializeEditors() {
    try {
        // Get current content
        const currentContent = codemirrorView?.state.doc.toString() || '';

        // Clean up existing instances
        if (codemirrorView) {
            codemirrorView.destroy();
        }

        // Reinitialize
        initializeCodeMirror();
        await initializeMilkdown();

        // Restore content
        if (currentContent && codemirrorView) {
            codemirrorView.dispatch({
                changes: {
                    from: 0,
                    to: codemirrorView.state.doc.length,
                    insert: currentContent
                }
            });
        }

        console.log('Editors reinitialized successfully');
    } catch (error) {
        console.error('Failed to reinitialize editors:', error);
    }
}
```

### Problem: Sync conflicts and data inconsistency

**Symptoms:**
- Different content in each editor
- Sync gets stuck in loops
- Content corruption

**Solutions:**

1. **Conflict resolution:**
```javascript
class SyncConflictResolver {
    constructor() {
        this.lastKnownGood = '';
        this.conflictCount = 0;
    }

    resolveConflict(cmContent, mdContent) {
        // Simple resolution: use the longer content
        const resolved = cmContent.length >= mdContent.length ? cmContent : mdContent;

        // Log conflict for debugging
        console.warn('Sync conflict resolved:', {
            cmLength: cmContent.length,
            mdLength: mdContent.length,
            resolved: resolved === cmContent ? 'codemirror' : 'milkdown'
        });

        this.lastKnownGood = resolved;
        this.conflictCount++;

        return resolved;
    }

    shouldResolveConflict(cmContent, mdContent) {
        // Only resolve if content is significantly different
        return Math.abs(cmContent.length - mdContent.length) > 10;
    }
}

const conflictResolver = new SyncConflictResolver();
```

2. **Content validation:**
```javascript
function validateSyncContent(content, source) {
    const issues = [];

    // Check for basic validity
    if (typeof content !== 'string') {
        issues.push('Content is not a string');
    }

    // Check for reasonable length
    if (content.length > 1024 * 1024) { // 1MB
        issues.push('Content is too large');
    }

    // Check for encoding issues
    if (content.includes('\uFFFD')) {
        issues.push('Content contains replacement characters');
    }

    // Check for obvious corruption
    if (content.includes('undefined') || content.includes('[object Object]')) {
        issues.push('Content appears corrupted');
    }

    if (issues.length > 0) {
        console.error(`Content validation failed for ${source}:`, issues);
        return false;
    }

    return true;
}
```

---

## Performance Problems

### Problem: Slow editor initialization

**Symptoms:**
- Long delay before editor appears
- Blank screen on page load
- Timeout errors

**Profiling:**
```javascript
function profileInitialization() {
    const marks = {};

    // Mark start
    performance.mark('init-start');
    marks.start = performance.now();

    // Mark major steps
    const markStep = (name) => {
        performance.mark(`init-${name}`);
        marks[name] = performance.now();
    };

    // Use in initialization
    initialize().then(() => {
        markStep('complete');

        // Calculate durations
        const durations = {};
        let lastTime = marks.start;

        Object.entries(marks).forEach(([name, time]) => {
            if (name !== 'start') {
                durations[name] = time - lastTime;
                lastTime = time;
            }
        });

        console.log('Initialization Performance:', durations);
    });
}
```

**Solutions:**

1. **Lazy load heavy dependencies:**
```javascript
async function optimizedInitialize() {
    // Load critical path first
    const container = document.getElementById('editor-container');
    container.style.visibility = 'visible';

    // Initialize lightweight CodeMirror first
    initializeCodeMirror();

    // Show loading indicator
    showLoadingIndicator();

    // Load Milkdown asynchronously
    try {
        await initializeMilkdown();
        hideLoadingIndicator();
    } catch (error) {
        showError('Failed to load rich editor');
    }

    // Initialize UI components
    initializeDivider();
    initializeToolbar();
}

function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loading-indicator';
    indicator.innerHTML = 'Loading rich editor...';
    document.getElementById('milkdown-editor').appendChild(indicator);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) indicator.remove();
}
```

2. **Reduce initial bundle size:**
```javascript
// Split initialization into chunks
async function chunkedInitialization() {
    // Chunk 1: Basic UI
    await new Promise(resolve => {
        initializeBasicUI();
        setTimeout(resolve, 0); // Yield to browser
    });

    // Chunk 2: CodeMirror
    await new Promise(resolve => {
        initializeCodeMirror();
        setTimeout(resolve, 0);
    });

    // Chunk 3: Milkdown
    await new Promise(resolve => {
        initializeMilkdown().then(resolve);
    });

    // Chunk 4: Additional features
    await new Promise(resolve => {
        initializeAdditionalFeatures();
        setTimeout(resolve, 0);
    });
}
```

### Problem: High CPU usage during editing

**Symptoms:**
- Browser becomes unresponsive
- High CPU usage in task manager
- Slow typing response

**Solutions:**

1. **Optimize debouncing:**
```javascript
class AdaptiveDebouncer {
    constructor() {
        this.baseDelay = 300;
        this.currentDelay = this.baseDelay;
        this.lastActivity = Date.now();
    }

    getDelay() {
        const timeSinceLastActivity = Date.now() - this.lastActivity;

        // Increase delay if user is typing rapidly
        if (timeSinceLastActivity < 100) {
            this.currentDelay = Math.min(this.currentDelay * 1.2, 1000);
        } else {
            this.currentDelay = Math.max(this.currentDelay * 0.9, this.baseDelay);
        }

        this.lastActivity = Date.now();
        return this.currentDelay;
    }
}

const adaptiveDebouncer = new AdaptiveDebouncer();
```

2. **Use requestIdleCallback:**
```javascript
function scheduleSync(callback) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 1000 });
    } else {
        setTimeout(callback, 0);
    }
}

// Usage
function handleCodeMirrorChange(update) {
    scheduleSync(() => {
        const content = update.state.doc.toString();
        syncToMilkdown(content);
    });
}
```

---

## Browser Compatibility

### Problem: Editor doesn't work in older browsers

**Symptoms:**
- JavaScript errors in older browsers
- Features not working
- Styling issues

**Browser Support Matrix:**

| Feature | Chrome 88+ | Firefox 85+ | Safari 14+ | Edge 88+ |
|---------|------------|-------------|------------|----------|
| ES6 Modules | ✓ | ✓ | ✓ | ✓ |
| CSS Grid | ✓ | ✓ | ✓ | ✓ |
| ResizeObserver | ✓ | ✓ | ✓ | ✓ |
| IntersectionObserver | ✓ | ✓ | ✓ | ✓ |

**Detection Script:**
```javascript
function checkBrowserCompatibility() {
    const features = {
        'ES6 Classes': (() => {
            try { eval('class Test {}'); return true; } catch (e) { return false; }
        })(),
        'Arrow Functions': (() => {
            try { eval('() => {}'); return true; } catch (e) { return false; }
        })(),
        'const/let': (() => {
            try { eval('const x = 1; let y = 2;'); return true; } catch (e) { return false; }
        })(),
        'Template Literals': (() => {
            try { eval('`template`'); return true; } catch (e) { return false; }
        })(),
        'Destructuring': (() => {
            try { eval('const {a} = {a:1};'); return true; } catch (e) { return false; }
        })(),
        'ResizeObserver': 'ResizeObserver' in window,
        'IntersectionObserver': 'IntersectionObserver' in window,
        'CSS Grid': CSS.supports('display', 'grid'),
        'CSS Flexbox': CSS.supports('display', 'flex')
    };

    const unsupported = Object.entries(features)
        .filter(([name, supported]) => !supported)
        .map(([name]) => name);

    if (unsupported.length > 0) {
        console.warn('Unsupported features detected:', unsupported);
        showBrowserWarning(unsupported);
    }

    return unsupported.length === 0;
}

function showBrowserWarning(unsupportedFeatures) {
    const warning = document.createElement('div');
    warning.className = 'browser-warning';
    warning.innerHTML = `
        <h3>Browser Compatibility Warning</h3>
        <p>Your browser doesn't support some required features:</p>
        <ul>${unsupportedFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
        <p>Please update your browser for the best experience.</p>
        <button onclick="this.parentElement.remove()">Dismiss</button>
    `;

    document.body.insertBefore(warning, document.body.firstChild);
}
```

**Polyfills:**
```html
<!-- Add to index.html for older browser support -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,ResizeObserver,IntersectionObserver"></script>
```

### Problem: iOS Safari specific issues

**Common iOS Safari Issues:**

1. **Viewport scaling:**
```css
/* Fix for iOS Safari viewport issues */
@supports (-webkit-touch-callout: none) {
    .editor-container {
        height: -webkit-fill-available;
    }
}
```

2. **Input focus issues:**
```javascript
// Fix for iOS Safari input focusing
function fixIOSFocus() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
        document.addEventListener('focusin', (e) => {
            // Prevent zoom on input focus
            const viewport = document.querySelector('meta[name=viewport]');
            viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1';

            setTimeout(() => {
                viewport.content = 'width=device-width, initial-scale=1';
            }, 500);
        });
    }
}
```

---

## UI and Layout Issues

### Problem: Pane resizing doesn't work

**Symptoms:**
- Divider doesn't respond to mouse drag
- Panes don't resize
- Layout breaks after resize

**Debugging:**
```javascript
function debugPaneResize() {
    const divider = document.getElementById('divider');
    const leftPane = document.getElementById('codemirror-pane');
    const rightPane = document.getElementById('milkdown-pane');

    console.log('Divider element:', divider);
    console.log('Left pane:', leftPane, leftPane?.offsetWidth);
    console.log('Right pane:', rightPane, rightPane?.offsetWidth);

    // Check event listeners
    const listeners = getEventListeners(divider);
    console.log('Divider event listeners:', listeners);

    // Test mouse events
    divider.addEventListener('mousedown', (e) => {
        console.log('Mousedown detected:', e.clientX);
    });
}
```

**Solutions:**

1. **Ensure proper event binding:**
```javascript
function fixPaneResizing() {
    const divider = document.getElementById('divider');

    // Remove existing listeners
    divider.replaceWith(divider.cloneNode(true));

    // Re-initialize divider
    initializeDivider();

    console.log('Pane resizing reinitialized');
}
```

2. **Handle edge cases:**
```javascript
function robustInitializeDivider() {
    const divider = document.getElementById('divider');
    const leftPane = document.getElementById('codemirror-pane');
    const rightPane = document.getElementById('milkdown-pane');
    const container = document.querySelector('.editor-body');

    if (!divider || !leftPane || !rightPane || !container) {
        console.error('Required elements for divider not found');
        return;
    }

    let isResizing = false;
    let startX = 0;
    let startLeftWidth = 0;
    let startRightWidth = 0;

    const startResize = (e) => {
        isResizing = true;
        startX = e.clientX;
        startLeftWidth = leftPane.getBoundingClientRect().width;
        startRightWidth = rightPane.getBoundingClientRect().width;

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        e.preventDefault();
    };

    const doResize = (e) => {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const containerWidth = container.getBoundingClientRect().width;
        const newLeftWidth = startLeftWidth + dx;
        const newRightWidth = startRightWidth - dx;

        // Minimum pane width (200px)
        if (newLeftWidth < 200 || newRightWidth < 200) return;

        const leftPercent = (newLeftWidth / containerWidth) * 100;
        const rightPercent = (newRightWidth / containerWidth) * 100;

        leftPane.style.flex = `0 0 ${leftPercent}%`;
        rightPane.style.flex = `0 0 ${rightPercent}%`;
    };

    const endResize = () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    };

    // Attach events
    divider.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', endResize);

    // Handle touch events for mobile
    divider.addEventListener('touchstart', (e) => {
        startResize({ clientX: e.touches[0].clientX, preventDefault: () => e.preventDefault() });
    });

    document.addEventListener('touchmove', (e) => {
        doResize({ clientX: e.touches[0].clientX });
    });

    document.addEventListener('touchend', endResize);
}
```

### Problem: Status bar not updating

**Symptoms:**
- Word count stuck at 0
- Cursor position not changing
- Sync status not updating

**Solutions:**

1. **Force status update:**
```javascript
function forceStatusUpdate() {
    if (!codemirrorView) return;

    const state = codemirrorView.state;
    const doc = state.doc;
    const selection = state.selection.main;

    // Force word count update
    const text = doc.toString();
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;

    const wordCountEl = document.getElementById('word-count');
    if (wordCountEl) wordCountEl.textContent = `Words: ${words}`;

    // Force character count update
    const charCountEl = document.getElementById('char-count');
    if (charCountEl) charCountEl.textContent = `Characters: ${text.length}`;

    // Force cursor position update
    const line = doc.lineAt(selection.head);
    const lineNum = line.number;
    const col = selection.head - line.from + 1;

    const positionEl = document.getElementById('cursor-position');
    if (positionEl) positionEl.textContent = `Line: ${lineNum}, Col: ${col}`;

    console.log('Status bar force updated');
}
```

2. **Re-attach update listeners:**
```javascript
function reattachStatusListeners() {
    // Remove old update listener and add new one
    if (codemirrorView) {
        // This requires rebuilding the editor with new extensions
        const currentContent = codemirrorView.state.doc.toString();
        const container = document.getElementById('codemirror-editor');

        codemirrorView.destroy();

        // Reinitialize with proper update listener
        initializeCodeMirror();

        // Restore content
        if (currentContent) {
            codemirrorView.dispatch({
                changes: { from: 0, to: 0, insert: currentContent }
            });
        }
    }
}
```

---

## Debugging Techniques

### Console Debugging

**Debug Commands:**
```javascript
// Global debug object
window.editorDebug = {
    // Get current state
    getState() {
        return {
            syncManager: { ...syncManager },
            codemirror: {
                exists: !!codemirrorView,
                content: codemirrorView?.state.doc.toString().slice(0, 100) + '...',
                length: codemirrorView?.state.doc.length
            },
            milkdown: {
                exists: !!milkdownEditor,
                container: document.getElementById('milkdown-editor')?.innerHTML.slice(0, 100) + '...'
            }
        };
    },

    // Force sync test
    async testSync() {
        const testContent = '# Debug Test\n\nThis is a sync test at ' + new Date().toISOString();
        console.log('Testing sync with content:', testContent.slice(0, 50) + '...');

        try {
            await syncToMilkdown(testContent);
            console.log('✓ Sync to Milkdown successful');
        } catch (error) {
            console.error('✗ Sync to Milkdown failed:', error);
        }
    },

    // Reset everything
    async reset() {
        console.log('Resetting editor...');
        resetSyncState();
        await reinitializeEditors();
        console.log('Reset complete');
    },

    // Check health
    async health() {
        const checker = new EditorHealthChecker();
        return await checker.runHealthCheck();
    },

    // Get performance metrics
    performance() {
        return {
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            } : 'Not available',
            timing: performance.getEntriesByType('measure'),
            navigation: performance.getEntriesByType('navigation')[0]
        };
    }
};

console.log('Debug tools available at window.editorDebug');
console.log('Try: editorDebug.getState(), editorDebug.testSync(), editorDebug.health()');
```

### Network Debugging

**Resource Loading Check:**
```javascript
function checkResourceLoading() {
    const resources = performance.getEntriesByType('resource');
    const failed = resources.filter(r => r.transferSize === 0 && r.name.includes('.js'));

    if (failed.length > 0) {
        console.error('Failed to load resources:', failed.map(r => r.name));
    }

    const slow = resources.filter(r => r.duration > 1000);
    if (slow.length > 0) {
        console.warn('Slow loading resources:', slow.map(r => ({
            name: r.name,
            duration: Math.round(r.duration) + 'ms'
        })));
    }

    return { failed, slow };
}
```

---

## Error Recovery

### Automatic Recovery System

```javascript
class ErrorRecoverySystem {
    constructor() {
        this.recoveryAttempts = new Map();
        this.maxAttempts = 3;
        this.setupErrorHandlers();
    }

    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'global');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise');
        });
    }

    handleError(error, type) {
        console.error(`${type} error:`, error);

        const errorKey = this.getErrorKey(error);
        const attempts = this.recoveryAttempts.get(errorKey) || 0;

        if (attempts < this.maxAttempts) {
            this.recoveryAttempts.set(errorKey, attempts + 1);
            this.attemptRecovery(error, type);
        } else {
            console.error('Max recovery attempts reached for:', errorKey);
            this.showFatalError(error);
        }
    }

    getErrorKey(error) {
        return error.message + ':' + (error.stack?.split('\n')[1] || '');
    }

    async attemptRecovery(error, type) {
        console.log('Attempting error recovery...');

        try {
            if (error.message.includes('sync')) {
                await this.recoverSync();
            } else if (error.message.includes('editor')) {
                await this.recoverEditor();
            } else {
                await this.recoverGeneral();
            }

            console.log('Recovery successful');
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
        }
    }

    async recoverSync() {
        resetSyncState();

        // Test sync functionality
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (codemirrorView && milkdownEditor) {
            const testContent = '# Recovery Test';
            await syncToMilkdown(testContent);
        }
    }

    async recoverEditor() {
        await reinitializeEditors();
    }

    async recoverGeneral() {
        // General recovery - reload the page
        if (confirm('An error occurred. Reload the page to recover?')) {
            window.location.reload();
        }
    }

    showFatalError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fatal-error';
        errorDiv.innerHTML = `
            <h3>Fatal Error</h3>
            <p>The editor encountered a fatal error and cannot recover automatically.</p>
            <details>
                <summary>Error Details</summary>
                <pre>${error.stack || error.message}</pre>
            </details>
            <button onclick="window.location.reload()">Reload Page</button>
        `;

        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
}

// Initialize error recovery
const errorRecovery = new ErrorRecoverySystem();
```

---

## Frequently Asked Questions

### General Questions

**Q: Why is the editor not loading?**
A: Check these common causes:
1. JavaScript disabled in browser
2. Network connectivity issues
3. Browser compatibility problems
4. Missing dependencies in bundle
5. CORS issues if serving from different domain

**Q: Can I use the editor offline?**
A: Yes, once loaded, the editor works offline. Consider implementing a service worker for better offline support.

**Q: How do I save content?**
A: The editor doesn't include built-in save functionality. You can access the content using:
```javascript
const content = codemirrorView.state.doc.toString();
localStorage.setItem('editorContent', content);
```

### Performance Questions

**Q: Why is the editor slow with large documents?**
A: Large documents (>50KB) can impact performance. Try:
1. Increasing debounce delay
2. Disabling real-time sync for large documents
3. Using pagination or virtual scrolling
4. Optimizing browser and clearing memory

**Q: How can I improve startup time?**
A: Several optimization strategies:
1. Use CDN for dependencies
2. Enable gzip compression
3. Implement lazy loading
4. Minimize initial bundle size
5. Use service worker for caching

### Customization Questions

**Q: How do I change the theme?**
A: Modify the CSS or change editor themes:
```javascript
// For CodeMirror
import { oneDark } from '@codemirror/theme-one-dark';

// For Milkdown
import { nord } from '@milkdown/theme-nord';
```

**Q: Can I add custom toolbar buttons?**
A: Yes, add buttons to the toolbar and initialize with event handlers:
```javascript
function addCustomButton() {
    const toolbar = document.querySelector('.toolbar');
    const button = document.createElement('button');
    button.textContent = 'Custom Action';
    button.onclick = () => {
        // Custom functionality
    };
    toolbar.appendChild(button);
}
```

### Technical Questions

**Q: How does the synchronization work?**
A: The sync system uses:
1. Event listeners on both editors
2. Debounced updates to prevent loops
3. Content serialization/parsing
4. Position preservation during updates

**Q: Can I extend the editor with plugins?**
A: Yes, both CodeMirror and Milkdown support plugins:
```javascript
// CodeMirror extensions
import { myCustomExtension } from './my-extension';

// Add to editor initialization
extensions: [
    // ... existing extensions
    myCustomExtension()
]
```

**Q: Is the editor accessible?**
A: The editor includes basic accessibility features:
- Keyboard navigation
- ARIA labels
- Screen reader support
- Focus management

For enhanced accessibility, consider additional testing and improvements.

This comprehensive troubleshooting guide should help resolve most issues encountered with the Dual-Pane Markdown Editor. For issues not covered here, check the browser console for specific error messages and use the debugging tools provided.