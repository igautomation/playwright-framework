<!-- Source: /Users/mzahirudeen/playwright-framework/src/utils/mobile/README.md -->

# Mobile Utilities

This directory contains utilities for mobile testing with Playwright.

## Core Files

- `mobileUtils.js` - Mobile utility for emulating and interacting with mobile devices
- `index.js` - Exports all mobile utilities

## Features

- Mobile device emulation
- Touch gesture simulation
- Device orientation and motion simulation
- Mobile viewport and user agent configuration

## Usage

```javascript
// Import all utilities
const mobile = require('../src/utils/mobile');

// Or import specific utilities
const { MobileUtils } = require('../src/utils/mobile');

// Create a mobile utility instance
const mobileUtils = new MobileUtils(page, {
  viewport: { width: 375, height: 667 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
});

// Set mobile emulation
await mobileUtils.setMobileEmulation();

// Emulate specific device
await mobileUtils.emulateDevice('iPhone 12');

// Simulate device orientation
await mobileUtils.setDeviceOrientation({
  alpha: 0,
  beta: 45,
  gamma: 10
});

// Simulate device motion
await mobileUtils.setDeviceMotion({
  acceleration: { x: 1, y: 2, z: 3 },
  accelerationIncludingGravity: { x: 1, y: 2, z: 9.8 },
  rotationRate: { alpha: 0, beta: 0, gamma: 0 },
  interval: 16
});

// Perform touch gestures
await mobileUtils.performTouchGesture('tap', {
  selector: '#element',
  count: 2
});

await mobileUtils.performTouchGesture('swipe', {
  direction: 'up',
  speed: 'normal'
});

await mobileUtils.performTouchGesture('pinch', {
  scale: 0.5 // < 1 pinch in, > 1 pinch out
});

await mobileUtils.performTouchGesture('rotate', {
  angle: 90
});
```