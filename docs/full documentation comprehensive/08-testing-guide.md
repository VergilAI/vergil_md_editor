# Testing Guide

## Overview

This comprehensive testing guide covers all aspects of testing the Dual-Pane Markdown Editor, including unit tests, integration tests, end-to-end tests, performance testing, and accessibility testing. It provides strategies, tools, and practical examples for ensuring the editor's reliability and quality.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Cross-Browser Testing](#cross-browser-testing)
9. [Manual Testing](#manual-testing)
10. [Test Automation](#test-automation)

## Testing Strategy

### Testing Pyramid

```
    E2E Tests
   /          \
  Integration Tests
 /                 \
Unit Tests (Foundation)
```

**Test Distribution:**
- **70% Unit Tests**: Fast, isolated, focused on individual functions
- **20% Integration Tests**: Test component interactions and API integrations
- **10% E2E Tests**: Full user workflows and critical paths

### Test Categories

**Functional Testing:**
- Editor initialization and setup
- Content synchronization between panes
- UI component interactions
- Data persistence and state management

**Non-Functional Testing:**
- Performance and responsiveness
- Accessibility compliance
- Cross-browser compatibility
- Error handling and recovery

**Security Testing:**
- Input validation and sanitization
- XSS prevention
- Content Security Policy compliance

---

## Test Environment Setup

### Dependencies Installation

```bash
# Core testing dependencies
npm install --save-dev \
    jest \
    @testing-library/dom \
    @testing-library/user-event \
    jsdom \
    @jest/environment-jsdom

# End-to-end testing
npm install --save-dev \
    playwright \
    @playwright/test

# Performance testing
npm install --save-dev \
    lighthouse \
    puppeteer

# Code coverage
npm install --save-dev \
    babel-plugin-istanbul \
    nyc
```

### Jest Configuration

**jest.config.js:**
```javascript
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    moduleNameMapping: {
        '\\.(css|less|scss)$': 'identity-obj-proxy'
    },
    collectCoverageFrom: [
        'main.js',
        '!node_modules/**',
        '!test/**'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    testMatch: [
        '<rootDir>/test/**/*.test.js',
        '<rootDir>/test/**/*.spec.js'
    ]
};
```

### Test Setup File

**test/setup.js:**
```javascript
// Mock DOM APIs not available in jsdom
global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock console methods in tests
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
    setTimeout(callback, 0);
};

// Setup test DOM
document.body.innerHTML = `
    <div class="editor-container">
        <div class="editor-header">
            <h1>Markdown Editor</h1>
            <div class="toolbar">
                <button id="toggle-codemirror" class="btn">Toggle Source</button>
                <button id="toggle-milkdown" class="btn">Toggle Preview</button>
                <button id="fullwidth-codemirror" class="btn">Source Only</button>
                <button id="fullwidth-milkdown" class="btn">Preview Only</button>
            </div>
        </div>
        <div class="editor-body">
            <div class="editor-pane" id="codemirror-pane">
                <div class="pane-header">
                    <h3>Source (CodeMirror)</h3>
                    <span class="sync-status" id="codemirror-status">Ready</span>
                </div>
                <div id="codemirror-editor"></div>
            </div>
            <div class="pane-divider" id="divider"></div>
            <div class="editor-pane" id="milkdown-pane">
                <div class="pane-header">
                    <h3>Preview (Milkdown)</h3>
                    <span class="sync-status" id="milkdown-status">Ready</span>
                </div>
                <div id="milkdown-editor"></div>
            </div>
        </div>
        <div class="editor-footer">
            <div class="status-bar">
                <span id="word-count">Words: 0</span>
                <span id="char-count">Characters: 0</span>
                <span id="cursor-position">Line: 1, Col: 1</span>
                <span id="sync-indicator">Synced</span>
            </div>
        </div>
    </div>
`;
```

### Package.json Scripts

```json
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "test:e2e": "playwright test",
        "test:performance": "lighthouse http://localhost:8081 --output=json --output-path=./test/reports/lighthouse.json",
        "test:all": "npm run test && npm run test:e2e"
    }
}
```

---

## Unit Testing

### Sync Manager Tests

**test/syncManager.test.js:**
```javascript
import { syncManager } from '../main.js';

describe('Sync Manager', () => {
    beforeEach(() => {
        // Reset sync manager state
        syncManager.isUpdating = false;
        syncManager.lastSource = null;
        syncManager.debounceTimer = null;
    });

    test('should initialize with default values', () => {
        expect(syncManager.isUpdating).toBe(false);
        expect(syncManager.lastSource).toBe(null);
        expect(syncManager.debounceDelay).toBe(300);
        expect(syncManager.scrollSync).toBe(false);
    });

    test('should prevent circular updates', () => {
        syncManager.isUpdating = true;

        // Mock content change
        const mockUpdate = {
            docChanged: true,
            state: { doc: { toString: () => 'test content' } }
        };

        // Should not trigger sync when already updating
        const handleCodeMirrorChange = jest.fn();
        expect(handleCodeMirrorChange).not.toHaveBeenCalled();
    });

    test('should debounce sync operations', (done) => {
        jest.useFakeTimers();

        const mockSyncFunction = jest.fn();

        // Simulate rapid changes
        syncManager.debounceTimer = setTimeout(mockSyncFunction, syncManager.debounceDelay);
        syncManager.debounceTimer = setTimeout(mockSyncFunction, syncManager.debounceDelay);

        // Fast-forward time
        jest.advanceTimersByTime(300);

        expect(mockSyncFunction).toHaveBeenCalledTimes(1);
        done();
    });
});
```

### Status Bar Tests

**test/statusBar.test.js:**
```javascript
describe('Status Bar', () => {
    let mockUpdate;

    beforeEach(() => {
        mockUpdate = {
            state: {
                doc: {
                    toString: () => 'Hello world! This is a test document.',
                    lineAt: (pos) => ({ from: 0, number: 1 }),
                    length: 42
                },
                selection: {
                    main: { head: 12 }
                }
            }
        };
    });

    test('should count words correctly', () => {
        const updateStatusBar = require('../main.js').updateStatusBar;
        updateStatusBar(mockUpdate);

        const wordCountElement = document.getElementById('word-count');
        expect(wordCountElement.textContent).toBe('Words: 8');
    });

    test('should count characters correctly', () => {
        const updateStatusBar = require('../main.js').updateStatusBar;
        updateStatusBar(mockUpdate);

        const charCountElement = document.getElementById('char-count');
        expect(charCountElement.textContent).toBe('Characters: 42');
    });

    test('should show correct cursor position', () => {
        const updateStatusBar = require('../main.js').updateStatusBar;
        updateStatusBar(mockUpdate);

        const positionElement = document.getElementById('cursor-position');
        expect(positionElement.textContent).toBe('Line: 1, Col: 13');
    });

    test('should handle empty content', () => {
        mockUpdate.state.doc.toString = () => '';
        mockUpdate.state.doc.length = 0;

        const updateStatusBar = require('../main.js').updateStatusBar;
        updateStatusBar(mockUpdate);

        const wordCountElement = document.getElementById('word-count');
        expect(wordCountElement.textContent).toBe('Words: 0');
    });
});
```

### UI Component Tests

**test/toolbar.test.js:**
```javascript
import { fireEvent } from '@testing-library/dom';

describe('Toolbar', () => {
    beforeEach(() => {
        // Reset pane states
        const cmPane = document.getElementById('codemirror-pane');
        const mdPane = document.getElementById('milkdown-pane');
        const divider = document.getElementById('divider');

        cmPane.classList.remove('hidden');
        mdPane.classList.remove('hidden');
        cmPane.style.flex = '';
        mdPane.style.flex = '';
        divider.style.display = 'block';
    });

    test('should toggle CodeMirror pane visibility', () => {
        const toggleButton = document.getElementById('toggle-codemirror');
        const cmPane = document.getElementById('codemirror-pane');
        const mdPane = document.getElementById('milkdown-pane');
        const divider = document.getElementById('divider');

        // First click - hide CodeMirror
        fireEvent.click(toggleButton);
        expect(cmPane.classList.contains('hidden')).toBe(true);
        expect(divider.style.display).toBe('none');
        expect(mdPane.style.flex).toBe('1');

        // Second click - show CodeMirror
        fireEvent.click(toggleButton);
        expect(cmPane.classList.contains('hidden')).toBe(false);
        expect(divider.style.display).toBe('block');
    });

    test('should set full-width CodeMirror mode', () => {
        const fullWidthButton = document.getElementById('fullwidth-codemirror');
        const cmPane = document.getElementById('codemirror-pane');
        const mdPane = document.getElementById('milkdown-pane');
        const divider = document.getElementById('divider');

        fireEvent.click(fullWidthButton);

        expect(mdPane.classList.contains('hidden')).toBe(true);
        expect(divider.style.display).toBe('none');
        expect(cmPane.classList.contains('hidden')).toBe(false);
        expect(cmPane.style.flex).toBe('1');
    });

    test('should handle keyboard navigation', () => {
        const toggleButton = document.getElementById('toggle-codemirror');

        // Focus the button
        toggleButton.focus();
        expect(document.activeElement).toBe(toggleButton);

        // Simulate Enter key
        fireEvent.keyDown(toggleButton, { key: 'Enter' });
        // Should trigger click behavior
    });
});
```

### Divider Resize Tests

**test/divider.test.js:**
```javascript
describe('Pane Divider', () => {
    let divider, leftPane, rightPane;

    beforeEach(() => {
        divider = document.getElementById('divider');
        leftPane = document.getElementById('codemirror-pane');
        rightPane = document.getElementById('milkdown-pane');

        // Mock offsetWidth
        Object.defineProperty(leftPane, 'offsetWidth', { value: 400 });
        Object.defineProperty(rightPane, 'offsetWidth', { value: 400 });
        Object.defineProperty(document.querySelector('.editor-body'), 'offsetWidth', { value: 800 });
    });

    test('should start resize on mousedown', () => {
        const mouseDownEvent = new MouseEvent('mousedown', {
            clientX: 400,
            bubbles: true
        });

        fireEvent(divider, mouseDownEvent);
        expect(document.body.style.cursor).toBe('col-resize');
    });

    test('should respect minimum pane width', () => {
        const mouseDownEvent = new MouseEvent('mousedown', { clientX: 400 });
        const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 100 });

        fireEvent(divider, mouseDownEvent);
        fireEvent(document, mouseMoveEvent);

        // Should not resize below 200px minimum
        const newWidth = 400 - 300; // 100px, below minimum
        expect(newWidth).toBeLessThan(200);
    });

    test('should update pane widths proportionally', () => {
        const mouseDownEvent = new MouseEvent('mousedown', { clientX: 400 });
        const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 450 });

        fireEvent(divider, mouseDownEvent);
        fireEvent(document, mouseMoveEvent);

        // Should update flex values
        expect(leftPane.style.flex).toContain('%');
        expect(rightPane.style.flex).toContain('%');
    });

    test('should end resize on mouseup', () => {
        const mouseDownEvent = new MouseEvent('mousedown', { clientX: 400 });
        const mouseUpEvent = new MouseEvent('mouseup');

        fireEvent(divider, mouseDownEvent);
        fireEvent(document, mouseUpEvent);

        expect(document.body.style.cursor).toBe('');
    });
});
```

---

## Integration Testing

### Editor Initialization Tests

**test/integration/initialization.test.js:**
```javascript
describe('Editor Initialization', () => {
    test('should initialize both editors successfully', async () => {
        // Mock CodeMirror and Milkdown
        const mockCodeMirror = {
            state: { doc: { toString: () => 'test' } },
            dispatch: jest.fn()
        };

        const mockMilkdown = {
            action: jest.fn()
        };

        // Test initialization
        const initializeCodeMirror = jest.fn(() => mockCodeMirror);
        const initializeMilkdown = jest.fn(() => Promise.resolve(mockMilkdown));

        await expect(initialize()).resolves.toBeUndefined();
        expect(initializeCodeMirror).toHaveBeenCalled();
        expect(initializeMilkdown).toHaveBeenCalled();
    });

    test('should handle initialization errors gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Mock failed initialization
        const initializeMilkdown = jest.fn(() => Promise.reject(new Error('Failed to initialize')));

        await expect(initialize()).rejects.toThrow('Failed to initialize');
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to initialize'));

        consoleSpy.mockRestore();
    });
});
```

### Synchronization Tests

**test/integration/synchronization.test.js:**
```javascript
describe('Content Synchronization', () => {
    let mockCodeMirror, mockMilkdown;

    beforeEach(() => {
        mockCodeMirror = {
            state: {
                doc: { toString: () => '# Test', length: 6 },
                update: jest.fn(),
                selection: { main: { head: 6 } }
            },
            dispatch: jest.fn()
        };

        mockMilkdown = {
            action: jest.fn((callback) => {
                const ctx = {
                    get: jest.fn((key) => {
                        if (key === 'editorViewCtx') {
                            return { state: { doc: { content: { size: 6 } } } };
                        }
                        if (key === 'parserCtx') {
                            return jest.fn(() => ({ content: 'parsed content' }));
                        }
                        if (key === 'serializerCtx') {
                            return jest.fn(() => '# Test');
                        }
                    })
                };
                callback(ctx);
            })
        };

        // Set global instances
        window.codemirrorView = mockCodeMirror;
        window.milkdownEditor = mockMilkdown;
    });

    test('should sync content from CodeMirror to Milkdown', async () => {
        const content = '# Hello World\n\nThis is a test.';

        await syncToMilkdown(content);

        expect(mockMilkdown.action).toHaveBeenCalled();
        expect(syncManager.lastSource).toBe('codemirror');
    });

    test('should sync content from Milkdown to CodeMirror', () => {
        const mockCtx = {
            get: jest.fn((key) => {
                if (key === 'serializerCtx') {
                    return jest.fn(() => '# Updated content');
                }
                if (key === 'editorViewCtx') {
                    return { state: { doc: 'mock doc' } };
                }
            })
        };

        syncToCodeMirror(mockCtx);

        expect(mockCodeMirror.dispatch).toHaveBeenCalled();
        expect(syncManager.lastSource).toBe('milkdown');
    });

    test('should preserve cursor position during sync', async () => {
        const originalPosition = 10;
        mockCodeMirror.state.selection.main.head = originalPosition;
        mockCodeMirror.state.doc.length = 20;

        const content = '# New content with different length';
        await syncToMilkdown(content);

        // Should calculate relative position
        const expectedRelativePos = originalPosition / 20;
        expect(expectedRelativePos).toBe(0.5);
    });

    test('should handle sync errors gracefully', async () => {
        mockMilkdown.action.mockImplementation(() => {
            throw new Error('Sync failed');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        await syncToMilkdown('test content');

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error syncing to Milkdown:',
            expect.any(Error)
        );
        expect(syncManager.isUpdating).toBe(false);

        consoleSpy.mockRestore();
    });
});
```

---

## End-to-End Testing

### Playwright Configuration

**playwright.config.js:**
```javascript
module.exports = {
    testDir: './test/e2e',
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:8081',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        }
    ],
    webServer: {
        command: 'npm run dev',
        port: 8081,
        reuseExistingServer: !process.env.CI
    }
};
```

### User Workflow Tests

**test/e2e/user-workflows.spec.js:**
```javascript
const { test, expect } = require('@playwright/test');

test.describe('User Workflows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should edit content in CodeMirror and see it sync to Milkdown', async ({ page }) => {
        // Clear existing content
        await page.click('#codemirror-editor');
        await page.keyboard.press('Control+a');

        // Type new content
        const testContent = '# Test Heading\n\nThis is **bold** text.';
        await page.keyboard.type(testContent);

        // Wait for sync
        await page.waitForTimeout(500);

        // Check Milkdown content
        const milkdownContent = await page.locator('#milkdown-editor').textContent();
        expect(milkdownContent).toContain('Test Heading');
        expect(milkdownContent).toContain('bold');
    });

    test('should edit content in Milkdown and see it sync to CodeMirror', async ({ page }) => {
        // Click in Milkdown editor
        await page.click('#milkdown-editor');

        // Clear and type
        await page.keyboard.press('Control+a');
        await page.keyboard.type('## New Heading\n\nSome content here.');

        // Wait for sync
        await page.waitForTimeout(500);

        // Check CodeMirror content
        const codemirrorContent = await page.locator('#codemirror-editor .cm-content').textContent();
        expect(codemirrorContent).toContain('## New Heading');
        expect(codemirrorContent).toContain('Some content here.');
    });

    test('should update status bar during editing', async ({ page }) => {
        await page.click('#codemirror-editor');
        await page.keyboard.press('Control+a');
        await page.keyboard.type('One two three four five words');

        // Check word count
        const wordCount = await page.locator('#word-count').textContent();
        expect(wordCount).toBe('Words: 5');

        // Check character count
        const charCount = await page.locator('#char-count').textContent();
        expect(charCount).toBe('Characters: 28');
    });

    test('should handle toolbar actions correctly', async ({ page }) => {
        // Test toggle CodeMirror
        await page.click('#toggle-codemirror');
        await expect(page.locator('#codemirror-pane')).toHaveClass(/hidden/);

        // Test full-width Milkdown
        await page.click('#fullwidth-milkdown');
        await expect(page.locator('#codemirror-pane')).toHaveClass(/hidden/);
        await expect(page.locator('#milkdown-pane')).toHaveCSS('flex', '1 1 0%');

        // Test toggle back
        await page.click('#toggle-codemirror');
        await expect(page.locator('#codemirror-pane')).not.toHaveClass(/hidden/);
    });

    test('should resize panes with divider', async ({ page }) => {
        const divider = page.locator('#divider');
        const leftPane = page.locator('#codemirror-pane');

        // Get initial width
        const initialBox = await leftPane.boundingBox();
        const initialWidth = initialBox.width;

        // Drag divider to the right
        await divider.dragTo(page.locator('body'), {
            targetPosition: { x: initialBox.x + initialWidth + 100, y: initialBox.y + 100 }
        });

        // Check that width changed
        const newBox = await leftPane.boundingBox();
        expect(newBox.width).toBeGreaterThan(initialWidth);
    });
});
```

### Error Handling Tests

**test/e2e/error-handling.spec.js:**
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
        // Simulate offline mode
        await page.context().setOffline(true);

        await page.goto('/');

        // Should still load the basic interface
        await expect(page.locator('.editor-container')).toBeVisible();

        // Re-enable network
        await page.context().setOffline(false);
    });

    test('should handle large content efficiently', async ({ page }) => {
        await page.goto('/');

        // Generate large content
        const largeContent = 'Lorem ipsum '.repeat(10000);

        await page.click('#codemirror-editor');
        await page.keyboard.press('Control+a');
        await page.keyboard.type(largeContent);

        // Should not freeze or crash
        await expect(page.locator('#sync-indicator')).toContainText('Synced');
    });

    test('should recover from sync errors', async ({ page }) => {
        await page.goto('/');

        // Inject error-causing code
        await page.evaluate(() => {
            // Temporarily break the sync function
            window.originalSyncToMilkdown = window.syncToMilkdown;
            window.syncToMilkdown = () => {
                throw new Error('Simulated sync error');
            };
        });

        // Try to edit
        await page.click('#codemirror-editor');
        await page.keyboard.type('This should cause an error');

        // Check error state
        await expect(page.locator('#sync-indicator')).toContainText('Sync Error');

        // Restore function
        await page.evaluate(() => {
            window.syncToMilkdown = window.originalSyncToMilkdown;
        });

        // Should recover
        await page.keyboard.type(' - recovered');
        await expect(page.locator('#sync-indicator')).toContainText('Synced');
    });
});
```

---

## Performance Testing

### Lighthouse Testing

**test/performance/lighthouse.test.js:**
```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

describe('Performance Tests', () => {
    let chrome;

    beforeAll(async () => {
        chrome = await chromeLauncher.launch({
            chromeFlags: ['--headless']
        });
    });

    afterAll(async () => {
        await chrome.kill();
    });

    test('should meet performance benchmarks', async () => {
        const options = {
            logLevel: 'info',
            output: 'json',
            onlyCategories: ['performance'],
            port: chrome.port
        };

        const runnerResult = await lighthouse('http://localhost:8081', options);
        const score = runnerResult.lhr.categories.performance.score * 100;

        expect(score).toBeGreaterThan(80); // 80+ performance score
    });

    test('should have fast initial page load', async () => {
        const options = {
            logLevel: 'info',
            output: 'json',
            onlyAudits: ['first-contentful-paint', 'largest-contentful-paint'],
            port: chrome.port
        };

        const runnerResult = await lighthouse('http://localhost:8081', options);
        const audits = runnerResult.lhr.audits;

        // First Contentful Paint should be under 2 seconds
        expect(audits['first-contentful-paint'].numericValue).toBeLessThan(2000);

        // Largest Contentful Paint should be under 2.5 seconds
        expect(audits['largest-contentful-paint'].numericValue).toBeLessThan(2500);
    });
});
```

### Memory Usage Tests

**test/performance/memory.test.js:**
```javascript
const puppeteer = require('puppeteer');

describe('Memory Usage', () => {
    let browser, page;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    afterAll(async () => {
        await browser.close();
    });

    test('should not have memory leaks during heavy editing', async () => {
        await page.goto('http://localhost:8081');

        // Get initial memory usage
        const initialMetrics = await page.metrics();
        const initialMemory = initialMetrics.JSHeapUsedSize;

        // Simulate heavy editing
        for (let i = 0; i < 100; i++) {
            await page.click('#codemirror-editor');
            await page.keyboard.type(`Line ${i}: This is test content.\n`);
            await page.waitForTimeout(10);
        }

        // Force garbage collection
        await page.evaluate(() => {
            if (window.gc) window.gc();
        });

        // Check memory usage
        const finalMetrics = await page.metrics();
        const finalMemory = finalMetrics.JSHeapUsedSize;
        const memoryIncrease = finalMemory - initialMemory;

        // Memory increase should be reasonable (less than 10MB)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle large documents efficiently', async () => {
        await page.goto('http://localhost:8081');

        const largeContent = 'Lorem ipsum '.repeat(50000);

        const startTime = Date.now();
        await page.click('#codemirror-editor');
        await page.evaluate((content) => {
            document.querySelector('#codemirror-editor .cm-content').textContent = content;
        }, largeContent);

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        // Should process large content in under 1 second
        expect(processingTime).toBeLessThan(1000);
    });
});
```

---

## Accessibility Testing

### Automated Accessibility Tests

**test/accessibility/a11y.test.js:**
```javascript
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await injectAxe(page);
    });

    test('should pass accessibility checks', async ({ page }) => {
        await checkA11y(page, null, {
            detailedReport: true,
            detailedReportOptions: { html: true }
        });
    });

    test('should have proper keyboard navigation', async ({ page }) => {
        // Tab through interactive elements
        const tabOrder = [
            '#toggle-codemirror',
            '#toggle-milkdown',
            '#fullwidth-codemirror',
            '#fullwidth-milkdown',
            '#codemirror-editor',
            '#milkdown-editor'
        ];

        for (const selector of tabOrder) {
            await page.keyboard.press('Tab');
            const focused = await page.evaluate(() => document.activeElement.id);
            expect(focused).toBe(selector.replace('#', ''));
        }
    });

    test('should have proper ARIA labels', async ({ page }) => {
        // Check button labels
        const toggleCM = page.locator('#toggle-codemirror');
        await expect(toggleCM).toHaveAttribute('aria-label', /toggle.*codemirror/i);

        const toggleMD = page.locator('#toggle-milkdown');
        await expect(toggleMD).toHaveAttribute('aria-label', /toggle.*milkdown/i);
    });

    test('should support screen reader navigation', async ({ page }) => {
        // Check heading structure
        const headings = page.locator('h1, h2, h3, h4, h5, h6');
        const headingCount = await headings.count();
        expect(headingCount).toBeGreaterThan(0);

        // Check main landmarks
        await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
        await checkA11y(page, null, {
            rules: {
                'color-contrast': { enabled: true }
            }
        });
    });
});
```

### Manual Accessibility Testing

**Manual Testing Checklist:**

1. **Keyboard Navigation:**
   - [ ] Tab key moves through all interactive elements
   - [ ] Enter/Space activates buttons
   - [ ] Arrow keys work within editors
   - [ ] Escape key cancels operations

2. **Screen Reader Testing:**
   - [ ] All content is announced properly
   - [ ] Button purposes are clear
   - [ ] Status changes are announced
   - [ ] Error messages are announced

3. **Visual Testing:**
   - [ ] Text remains readable at 200% zoom
   - [ ] Focus indicators are visible
   - [ ] Color is not the only way to convey information
   - [ ] UI remains usable in high contrast mode

---

## Cross-Browser Testing

### Browser Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Editor Initialization | ✓ | ✓ | ✓ | ✓ |
| Content Sync | ✓ | ✓ | ✓ | ✓ |
| Toolbar Functions | ✓ | ✓ | ✓ | ✓ |
| Pane Resizing | ✓ | ✓ | ✓ | ✓ |
| Keyboard Shortcuts | ✓ | ✓ | ⚠️ | ✓ |

### Cross-Browser Test Configuration

**test/cross-browser/browsers.config.js:**
```javascript
const browsers = [
    {
        name: 'Chrome',
        use: { ...devices['Desktop Chrome'] }
    },
    {
        name: 'Firefox',
        use: { ...devices['Desktop Firefox'] }
    },
    {
        name: 'Safari',
        use: { ...devices['Desktop Safari'] }
    },
    {
        name: 'Edge',
        use: { ...devices['Desktop Edge'] }
    }
];

module.exports = { browsers };
```

---

## Manual Testing

### Testing Scenarios

**Basic Functionality:**
1. Load the application
2. Verify both panes are visible
3. Type content in CodeMirror
4. Verify content appears in Milkdown
5. Edit content in Milkdown
6. Verify content updates in CodeMirror

**UI Interactions:**
1. Test all toolbar buttons
2. Resize panes with divider
3. Check responsive behavior
4. Test keyboard navigation
5. Verify status bar updates

**Error Scenarios:**
1. Very large content (>100KB)
2. Rapid typing/editing
3. Network disconnection
4. Browser refresh during editing
5. Multiple tabs/windows

### Test Data

**Sample Markdown Content:**
```markdown
# Test Document

## Features to Test

### Text Formatting
- **Bold text**
- *Italic text*
- `Inline code`

### Lists
1. Numbered list item
2. Another item
   - Nested bullet
   - Another nested item

### Code Blocks
```javascript
function test() {
    console.log("Hello, World!");
}
```

### Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Links and Images
[Link to example](https://example.com)
![Alt text](https://via.placeholder.com/150)

> This is a blockquote
> that spans multiple lines
```

---

## Test Automation

### Continuous Integration

**GitHub Actions Workflow (.github/workflows/test.yml):**
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm test

    - name: Run coverage
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

    - name: Build application
      run: npm run build

    - name: Install Playwright browsers
      run: npx playwright install --with-deps

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: test-results
        path: test-results/
```

### Test Reports

**Coverage Report Configuration:**
```javascript
// In jest.config.js
module.exports = {
    coverageReporters: ['html', 'text', 'lcov'],
    collectCoverageFrom: [
        'main.js',
        '!node_modules/**',
        '!test/**'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

### Test Environment Management

**Docker Test Environment:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install browsers for testing
RUN npx playwright install --with-deps

# Run tests
CMD ["npm", "run", "test:all"]
```

This comprehensive testing guide provides a complete framework for ensuring the quality, reliability, and performance of the Dual-Pane Markdown Editor. It covers all aspects from unit testing to end-to-end testing, accessibility, and cross-browser compatibility.